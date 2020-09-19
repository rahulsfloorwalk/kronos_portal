import logging

from django.conf import settings
from notifications.models import Notification
from registration.models import GROUP_NAME_AUDITOR

from celery import shared_task

from .message import send_message
from .. import verbs
from auditor.service.profile_info_service import find_profile_info_by_user_id


_logger = logging.getLogger(__name__)


def send_notification_message(notif_id):
    if settings.MESSAGE_SWITCH['NOTIFICATION_MESSAGE']:
        notification_message_task.delay(notif_id)
    else:
        _logger.info("notification message disabled. skipping message for notification id : %s", notif_id)


@shared_task(ignore_result=True)
def notification_message_task(notif_id):
    notif = Notification.objects.get(pk=notif_id)

    if notif.recipient.groups.filter(name=GROUP_NAME_AUDITOR).all():
        user_id = notif.recipient.id
        profile_info = find_profile_info_by_user_id(user_id)
        first_name = profile_info.first_name
        mobile_number = profile_info.mobile_number
        if notif.verb == verbs.AUDIT_STORE_UNSUBMITTED:
            send_message(first_name, mobile_number)
            return True
