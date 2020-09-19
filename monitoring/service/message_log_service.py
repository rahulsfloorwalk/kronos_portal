from django.utils import timezone
from ..models import MessageLog


def log_message(mobile_number, msg_status):
    ml = MessageLog()
    ml.sent_to = mobile_number
    ml.message_status = msg_status
    ml.sent_at = timezone.now()
    ml.save()
    return ml
