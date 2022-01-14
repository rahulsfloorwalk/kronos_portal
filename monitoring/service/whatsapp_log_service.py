from django.utils import timezone
from ..models import WhatsappLog


def log_message(whatsapp_number: str, communication_id: str, message_id: str):
    wl = WhatsappLog()
    wl.sent_to = whatsapp_number
    wl.communication_id = communication_id
    wl.message_id = message_id
    wl.sent_at = timezone.now()
    wl.save()
    return wl
