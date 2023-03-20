import logging

from django.conf import settings
from django.db.transaction import atomic

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service,audit_service
from auditor.models import Preferences
from manager.models import City
from notify.service import opportunity_notification as opp_notification_service
from ..models import OpportunitySmsRecord

from manager.service.opportunity_email import get_auditor_list_by_filter
from notify.service.message import send_message
from registration.service.auditor import find_auditor_by_id

from kronos.exceptions import ObjectNotFound, AppLogicError
from kronos.utils import get_dialcode

from celery import shared_task

_logger = logging.getLogger(__name__)


@atomic
def schedule_opportunity_sms_for_audit_cycle_with_filters(audit_cycle_id: int, filters: dict):
    from notify.service import opportunity_notification as opp_notification_service
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        raise AppLogicError("audit cycle must be in UPCOMING or ACTIVE status to send opportunity email")
    MAX_SMS_COUNT = int(settings.MSG91['MAX_SMS_SENT_COUNT'])
    CHANNEL = 'sms'
    if filters.get('city')=='11132323':
        city_list=audit_service.find_audit_city_by_audit_cycle_id(audit_cycle_id)
        if city_list==[]:
            raise AppLogicError("Audits Are Not Available For Any City")
        for i in city_list:
            filters['city']=i.id
            filtered_users_in_city = get_auditor_list_by_filter(filters)
            next_user_list = opp_notification_service.find_next_users_for_notification(i.id, audit_cycle_id, CHANNEL, filtered_users_in_city)
            next_user_list = next_user_list[:MAX_SMS_COUNT]
            if len(next_user_list) == 0:
                continue
            opp = OpportunitySmsRecord()
            opp.city = i
            opp.audit_cycle = audit_cycle
            opp.total_count = len(next_user_list)
            opp.record_data = {
                'user_list': next_user_list
            }
            opp.progress_count = 0
            opp.save()
            send_opportunity_sms_for_record.delay(opp.id)
    else:
        city = City.objects.get(pk=filters.get('city'))
        filtered_users_in_city = get_auditor_list_by_filter(filters)
        next_user_list = opp_notification_service.find_next_users_for_notification(city.id, audit_cycle_id, CHANNEL, filtered_users_in_city)
        next_user_list = next_user_list[:MAX_SMS_COUNT]

        if len(next_user_list) == 0:
            raise AppLogicError("Auditors are not remaining in this city")

        opp = OpportunitySmsRecord()
        opp.city = city
        opp.audit_cycle = audit_cycle
        opp.total_count = len(next_user_list)
        opp.record_data = {
            'user_list': next_user_list
        }
        opp.progress_count = 0
        opp.save()
        send_opportunity_sms_for_record.delay(opp.id)

@shared_task(ignore_result=True)
def send_opportunity_sms_for_record(opportunity_record_id):
    try:
        opp = OpportunitySmsRecord.objects.get(pk=opportunity_record_id)
    except OpportunitySmsRecord.DoesNotExist as e:
        _logger.warn("OpportunitySmsRecord(%s): NOT FOUND", opportunity_record_id)
        return

    if not settings.MESSAGE_SWITCH['NOTIFICATION_MESSAGE']:
        _logger.info("opportunity sms disabled. skipping opportunity sms for audit_cycle(%s)", opp.audit_cycle_id)

    params = []
    dial_code = get_dialcode(opp.city.country)
    client_name = opp.audit_cycle.client.auditor_display_name()
    flow_id = settings.MSG91_FLOW_IDS['AUDIT_OPPORTUNITY']
    for user_id in opp.record_data['user_list']:
        try:
            user = find_auditor_by_id(user_id)
        except ObjectNotFound as e:
            _logger.warn("auditor with user_id: %s NOT FOUND", user_id)
            continue
        try:
            if not user.is_active or not user.preferences.receive_new_opportunities_sms:
                _logger.warn("skip auditor with user_id: %s", user_id)
                continue
        except Preferences.DoesNotExist as e:
            _logger.warn("skip auditor with user_id: %s", user_id)
            continue

        mobile_number = user.profileinfo.mobile_number
        params.append({
            "mobiles": "{}{}".format(dial_code[1:], mobile_number),
            "brand": client_name,
            "link": "https://portal.floorwalk.in"
        })
    send_message(flow_id, params)
    opp.progress_count = len(params)
    opp.save()
    _logger.info("scheduled %s sms for audit cycle: %s", len(params), opp.audit_cycle_id)

