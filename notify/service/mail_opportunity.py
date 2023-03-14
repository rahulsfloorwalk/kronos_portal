import logging

from django.conf import settings
from django.template.loader import get_template
from django.db.models import F
from django.db.transaction import atomic

from celery.result import ResultSet

from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service,audit_service
from auditor.models import Preferences
from auditor.service.profile_info_service import count_profileinfo_in_city
from manager.service.opportunity_email import get_auditor_list_by_filter
from registration.service.auditor import find_auditor_by_id
from registration.context import registration_context
from manager.models import City
from ..models import OpportunityEmailRecord, OpportunitySmsRecord, OpportunityWhatsappRecord

from celery import shared_task

from .mail import send_email

_logger = logging.getLogger(__name__)

@atomic
def schedule_opportunity_emails_for_audit_cycle_and_city(audit_cycle_id, city_id):
    try:
        city = City.objects.get(pk=city_id)
    except City.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        raise AppLogicError("audit cycle must be in UPCOMING or ACTIVE status to send opportunity email")

    opp = OpportunityEmailRecord()
    opp.city = city
    opp.audit_cycle = audit_cycle
    opp.total_count = count_profileinfo_in_city(city_id)
    opp.progress_count = 0
    opp.save()

    # start the task to send the emails
    send_opportunity_emails_for_record.delay(opp.id)

    return opp

@atomic
def schedule_opportunity_emails_for_audit_cycle_with_filters(audit_cycle_id: int, filters: dict):
    from notify.service import opportunity_notification as opp_notification_service
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        raise AppLogicError("audit cycle must be in UPCOMING or ACTIVE status to send opportunity email")

    MAX_EMAIL_SENT_COUNT = int(settings.EMAIL_SWITCH['MAX_EMAIL_SENT_COUNT'])
    CHANNEL = 'email'
    if filters.get('city')=='11132323':
        city_list=audit_service.find_audit_city_by_audit_cycle_id(audit_cycle_id)
        for i in city_list:
            filters['city']=i.id
            filtered_users_in_city = get_auditor_list_by_filter(filters)
            next_user_list = opp_notification_service.find_next_users_for_notification(i.id, audit_cycle_id, CHANNEL, filtered_users_in_city)
            next_user_list = next_user_list[:MAX_EMAIL_SENT_COUNT]
            if len(next_user_list) == 0:
                raise AppLogicError("Auditors are not remaining in this city")
            opp = OpportunityEmailRecord()
            opp.city = i
            opp.audit_cycle = audit_cycle
            opp.total_count = len(next_user_list)
            opp.record_data = {
                'user_list': next_user_list
            }
            opp.progress_count = 0
            opp.save()
            send_opportunity_emails_for_record.delay(opp.id)
    else:
        city = City.objects.get(pk=filters.get('city'))
        filtered_users_in_city = get_auditor_list_by_filter(filters)
        next_user_list = opp_notification_service.find_next_users_for_notification(city.id, audit_cycle_id, CHANNEL, filtered_users_in_city)
        next_user_list = next_user_list[:MAX_EMAIL_SENT_COUNT]

        if len(next_user_list) == 0:
            raise AppLogicError("Auditors are not remaining in this city")

        opp = OpportunityEmailRecord()
        opp.city = city
        opp.audit_cycle = audit_cycle
        opp.total_count = len(next_user_list)
        opp.record_data = {
            'user_list': next_user_list
        }
        opp.progress_count = 0
        opp.save()
        send_opportunity_emails_for_record.delay(opp.id)

@shared_task(ignore_result=True)
def send_opportunity_emails_for_record(opportunity_email_record_id):
    try:
        opp = OpportunityEmailRecord.objects.get(pk=opportunity_email_record_id)
    except OpportunityEmailRecord.DoesNotExist as e:
        _logger.warn("OpportunityEmailRecord(%s): NOT FOUND", opportunity_email_record_id)
        return

    async_results = ResultSet([])
    for user_id in opp.record_data['user_list']:
        if settings.EMAIL_SWITCH['OPPORTUNITY_EMAIL']:
            async_results.add(opportunity_email_task.delay(opp.id, opp.audit_cycle_id, user_id))
        else:
            _logger.info("opportunity email disabled. skipping opportunity email for audit_cycle(%s) and user(%s)", opp.audit_cycle_id, user_id)

    _logger.info("scheduled %s emails for audit cycle: %s", len(async_results), opp.audit_cycle_id)


@shared_task()
def opportunity_email_task(opp_id, audit_cycle_id, user_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        _logger.warn("audit cycle(%s): %s must be in UPCOMING or ACTIVE status to send opportunity email", audit_cycle_id, audit_cycle.name)
        return False

    try:
        user = find_auditor_by_id(user_id)
    except ObjectNotFound as e:
        _logger.warn("auditor with user_id: %s NOT FOUND", user_id)
        return False

    try:
        if not user.is_active or not user.preferences.receive_new_opportunities_email:
            return False
    except Preferences.DoesNotExist as e:
        pass

    params = {
        'client_name': audit_cycle.client.auditor_display_name(),
        'client_logo_url': audit_cycle.client.auditor_logo_url(),
        'city_name': user.profileinfo.city.name,
        'first_name': user.profileinfo.first_name,
        'last_name': user.profileinfo.last_name,
        'to_email': user.email,
        'description': audit_cycle.description.replace("###", "").replace("**", "").replace("*", "").replace("##", ""),
        **registration_context(),
    }

    # generate email from templates
    subject = "Hi {}, {} audits are available in {}!".format(params['first_name'], params['client_name'], params['city_name'])
    html_message = get_template("notify/opportunity_email.html").render(params)
    txt_message = get_template("notify/opportunity_email.txt").render(params)

    send_email(params['to_email'], subject, html_message, txt_message)

    # increment the progress counter in the DB
    OpportunityEmailRecord.objects.filter(pk=opp_id).update(progress_count=F('progress_count') + 1)
    return True


def find_opportunity_email_records_by_audit_cycle(audit_cycle_id):
    return OpportunityEmailRecord.objects.filter(audit_cycle_id=audit_cycle_id)

def find_opportunity_sms_records_by_audit_cycle(audit_cycle_id: int):
    return OpportunitySmsRecord.objects.filter(audit_cycle_id=audit_cycle_id)

def find_opportunity_whatsapp_records_by_audit_cycle(audit_cycle_id: int):
    return OpportunityWhatsappRecord.objects.filter(audit_cycle_id=audit_cycle_id)