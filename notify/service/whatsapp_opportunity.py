import logging

from django.conf import settings
from django.db.models import F
from django.db.transaction import atomic

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service
from auditor.models import Preferences
from manager.models import City
from ..models import OpportunityWhatsappRecord

from manager.service.opportunity_email import get_auditor_count_by_filter, get_auditor_list_by_filter
from notify.service.message import send_whatsapp_message
from registration.service.auditor import find_auditor_by_id

from kronos.exceptions import ObjectNotFound, AppLogicError
from kronos.utils import get_dialcode

from celery import shared_task
from celery.result import ResultSet

_logger = logging.getLogger(__name__)


@atomic
def schedule_opportunity_whatsapp_for_audit_cycle_with_filters(audit_cycle_id: int, filters: dict):
    try:
        city = City.objects.get(pk=filters.get('city', ''))
    except City.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        raise AppLogicError("audit cycle must be in UPCOMING or ACTIVE status to send opportunity alert")

    auditor_count = get_auditor_count_by_filter(filters)
    if auditor_count > int(settings.MAX_WHATSAPP_SENT_COUNT):
        raise AppLogicError('Auditor count must below {}'.format(settings.MAX_SMS_SENT_COUNT))

    opp = OpportunityWhatsappRecord()
    opp.city = city
    opp.audit_cycle = audit_cycle
    opp.total_count = get_auditor_count_by_filter(filters)
    opp.record_data = {
        'user_list': get_auditor_list_by_filter(filters)
    }
    opp.progress_count = 0
    opp.save()

    # start the task to send the whatsapp notification
    send_opportunity_whatsapp_message_for_record.delay(opp.id)

    return opp

@shared_task(ignore_result=True)
def send_opportunity_whatsapp_message_for_record(opportunity_record_id):
    try:
        opp = OpportunityWhatsappRecord.objects.get(pk=opportunity_record_id)
    except OpportunityWhatsappRecord.DoesNotExist as e:
        _logger.warn("OpportunityWhatsappRecord(%s): NOT FOUND", opportunity_record_id)
        return

    async_results = ResultSet([])
    for user_id in opp.record_data['user_list']:
        if settings.MESSAGEBIRD_SWITCH:
            async_results.add(opportunity_whatsapp_task.delay(opp.id, opp.audit_cycle_id, user_id))
        else:
            _logger.info("opportunity whatsapp message disabled. skipping opportunity whatsapp message for audit_cycle(%s) and user(%s)", opp.audit_cycle_id, user_id)

    _logger.info("scheduled %s whatsapp messages for audit cycle: %s", len(async_results), opp.audit_cycle_id)


@shared_task()
def opportunity_whatsapp_task(opp_id, audit_cycle_id, user_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        _logger.warn("audit cycle(%s): %s must be in UPCOMING or ACTIVE status to send opportunity whatsapp message", audit_cycle_id, audit_cycle.name)
        return False

    try:
        user = find_auditor_by_id(user_id)
    except ObjectNotFound as e:
        _logger.warn("auditor with user_id: %s NOT FOUND", user_id)
        return False

    try:
        if not user.is_active or not user.profileinfo.whatsapp_number or not user.profileinfo.city or not user.preferences.receive_transactional_whatsapp_message:
            return False
    except Preferences.DoesNotExist as e:
        return False

    whatsapp_number = user.profileinfo.whatsapp_number
    template_name = settings.WHATSAPP_TEMPLATE['AUDIT_OPPORTUNITY']

    city_name = user.profileinfo.city.name
    country_code = user.profileinfo.city.country
    dial_code = get_dialcode(country_code)
    client_name = audit_cycle.client.auditor_display_name()

    params = [{'default':client_name}, {'default':city_name}]

    send_whatsapp_message(whatsapp_number, dial_code, template_name, params)

    # increment the progress counter in the DB
    OpportunityWhatsappRecord.objects.filter(pk=opp_id).update(progress_count=F('progress_count') + 1)
    return True