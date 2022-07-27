import logging

from django.conf import settings
from notifications.models import Notification
from audit_store.models import AuditStore
from auditor.models import ProfileInfo, Preferences
from auditor.service import preferences_service
from kronos.utils import get_dialcode
from registration.models import GROUP_NAME_AUDITOR

from celery import shared_task

from .message import send_whatsapp_message
from .. import verbs
from auditor.service.profile_info_service import find_profile_info_by_user_id


_logger = logging.getLogger(__name__)


# def send_notification_message(notif_id):
#     if settings.MESSAGE_SWITCH['NOTIFICATION_MESSAGE']:
#         notification_message_task.delay(notif_id)
#     else:
#         _logger.info("notification message disabled. skipping message for notification id : %s", notif_id)


# @shared_task(ignore_result=True)
# def notification_message_task(notif_id):
#     notif = Notification.objects.get(pk=notif_id)

#     if notif.recipient.groups.filter(name=GROUP_NAME_AUDITOR).all():
#         user_id = notif.recipient.id
#         profile_info = find_profile_info_by_user_id(user_id)
#         first_name = profile_info.first_name
#         mobile_number = profile_info.mobile_number
#         if notif.verb == verbs.AUDIT_STORE_UNSUBMITTED:
#             send_message(first_name, mobile_number)
#             return True


def send_whatsapp_notification(notif_id, message=""):
    if settings.MESSAGEBIRD_SWITCH:
        notification_whatsapp_task.delay(notif_id, message)
    else:
        _logger.info("notification whatsapp message disabled. skipping whatsapp message for notification id : %s", notif_id)


@shared_task(ignore_result=True)
def notification_whatsapp_task(notif_id, message=""):
    notif = Notification.objects.get(pk=notif_id)
    if notif.recipient.groups.filter(name=GROUP_NAME_AUDITOR).all():
        try:
            user_id = notif.recipient.id
            profile_info = find_profile_info_by_user_id(user_id)
            preferences = preferences_service.find_preferences_by_user_id(user_id)
            if not profile_info.user.is_active or not profile_info.whatsapp_number or not preferences.receive_transactional_whatsapp_message:
                return False
            country_code = profile_info.city.country
            dial_code = get_dialcode(country_code)
            whatsapp_number = profile_info.whatsapp_number
        except (ProfileInfo.DoesNotExist, Preferences.DoesNotExist) as e:
            _logger.info("Profileinfo is not complete. skipping whatsapp message for notification id : %s", notif_id)

        if notif.verb == verbs.AUDIT_STORE_ASSIGNED:
            params, template_name = get_params_from_audit_store(notif, message)
            send_whatsapp_message(whatsapp_number, dial_code, template_name, params)
            return True

        elif notif.verb == verbs.AUDIT_STORE_UNSUBMITTED:
            params, template_name = get_params_from_audit_store(notif, message)
            if params and template_name:
                send_whatsapp_message(whatsapp_number, dial_code, template_name, params)
                return True

    return False

def get_params_from_audit_store(notif_id, message):
    audit_store = notif_id.action_object
    first_name = audit_store.user.profileinfo.first_name
    client = audit_store.audit.audit_cycle.client.auditor_display_name()
    audit_date = audit_store.audit_date.strftime('%m/%d/%Y')

    if notif_id.verb == verbs.AUDIT_STORE_ASSIGNED:
        template_name = settings.WHATSAPP_TEMPLATE['AUDIT_ASSIGNED']

        # Make field sequence as per api documentation/message template
        params = [{"default":first_name}, {"default":client}, {"default":audit_date}]
        return params, template_name

    elif notif_id.verb == verbs.AUDIT_STORE_UNSUBMITTED:
        report_log = audit_store.audit_store_status_log.filter(status = AuditStore.ACKNOWLEDGED).latest()
        if report_log:
            proof_tag_str = ''
            template_name = settings.WHATSAPP_TEMPLATE['AUDIT_REVERT_WITHOUT_PROOF']
            # Make field sequence as per api documentation/message template
            params = [{'default':first_name}, {'default':client}, {'default':audit_date}, {'default':message}]
            if 'proof_tags' in report_log.report_data:
                if report_log.report_data['proof_tags']:
                    template_name = settings.WHATSAPP_TEMPLATE['AUDIT_REVERT_WITH_PROOF']
                    proof_tag_str = ', '.join(report_log.report_data['proof_tags'])
                    # Make field sequence as per api documentation/message template
                    params = [{'default':first_name}, {'default':client}, {'default':audit_date}, {'default':message}, {'default':proof_tag_str}]
            return params, template_name
        else:
            _logger.info('report status log not found. skipping whatsapp message for notification id : %s', notif_id)
    return [False, False]