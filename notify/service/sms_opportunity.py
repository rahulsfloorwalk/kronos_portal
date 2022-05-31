import logging

from django.conf import settings
from django.db.transaction import atomic

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service
from manager.models import City
from ..models import OpportunitySmsRecord

from manager.service.opportunity_email import get_auditor_count_by_filter, get_auditor_list_by_filter
from notify.service.message import send_message
from registration.service.auditor import find_auditor_by_id

from kronos.exceptions import ObjectNotFound, AppLogicError
from kronos.utils import get_dialcode

from celery import shared_task

_logger = logging.getLogger(__name__)


@atomic
def schedule_opportunity_sms_for_audit_cycle_with_filters(audit_cycle_id: int, filters: dict):
    try:
        city = City.objects.get(pk=filters.get('city', ''))
    except City.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    if audit_cycle.status not in (AuditCycle.UPCOMING, AuditCycle.ACTIVE):
        raise AppLogicError("audit cycle must be in UPCOMING or ACTIVE status to send opportunity alert")

    auditor_count = get_auditor_count_by_filter(filters)
    if auditor_count > int(settings.MSG91['MAX_SMS_SENT_COUNT']):
        raise AppLogicError('Auditor count must below {}'.format(settings.MSG91['MAX_SMS_SENT_COUNT']))

    opp = OpportunitySmsRecord()
    opp.city = city
    opp.audit_cycle = audit_cycle
    opp.total_count = auditor_count
    opp.record_data = {
        'user_list': get_auditor_list_by_filter(filters)
    }
    opp.progress_count = 0
    opp.save()

    # start the task to send the whatsapp notification
    send_opportunity_sms_for_record.delay(opp.id)

    return opp

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
            return False

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

