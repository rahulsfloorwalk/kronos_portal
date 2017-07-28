from django.utils import timezone
from kronos.exceptions import ObjectNotFound

from monitoring.models import EmailLog

def log_email(to_email, subject, html_message, txt_message):
    el = EmailLog()
    el.sent_to = to_email
    el.subject = subject
    el.html_body = html_message
    el.text_body = txt_message
    el.sent_at = timezone.now()
    el.save()
    return el

def find_email_log_by_email(to_email):
    return EmailLog.objects.filter(sent_to__iexact=to_email).values("id","sent_to","subject","sent_at")

def find_email_log_by_id(email_log_id):
    try:
        return EmailLog.objects.get(pk=email_log_id)
    except EmailLog.DoesNotExist as e:
        raise ObjectNotFound from e
