from django.core.mail import EmailMultiAlternatives

from monitoring.service import email_log_service
from notify.service.mail_qa_performance import BLOCKED_EMAILS

def is_email_blocked(email):
    """Check if the email is in the blocked list."""
    return email in BLOCKED_EMAILS

SUBJECT_PREFIX = "[FloorWalk]"

def send_email(to_email, subject, html_message, txt_message):
    "prepends a [FloorWalk] to the subject and sends an email containing both the HTML and plain text versions to to_email"

    if type(to_email) == str:
        to_email = (to_email,)

    if type(to_email) in (list, tuple, set):
        to_email = to_email

    filtered_emails = [email for email in to_email if not is_email_blocked(email)]
    subject = "{} {}".format(SUBJECT_PREFIX, subject)
    msg = EmailMultiAlternatives(subject, txt_message, to=filtered_emails)
    msg.attach_alternative(html_message, "text/html")
    msg.send()

    # if type(to_email) in (list, tuple, set):
    #     log_obj = None
    #     for email in to_email:
    #         log_obj = email_log_service.log_email(email, subject, html_message, txt_message)
    #     return log_obj
    # else:
    #     return email_log_service.log_email(to_email, subject, html_message, txt_message)

    if type(filtered_emails) in (list, tuple, set):
        log_obj = None
        for email in filtered_emails:
            log_obj = email_log_service.log_email(email, subject, html_message, txt_message)
        return log_obj
    else:
        return email_log_service.log_email(filtered_emails, subject, html_message, txt_message)

