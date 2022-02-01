from django.core.mail import EmailMultiAlternatives

from monitoring.service import email_log_service

SUBJECT_PREFIX = "[FloorWalk]"

def send_email(to_email, subject, html_message, txt_message):
    "prepends a [FloorWalk] to the subject and sends an email containing both the HTML and plain text versions to to_email"

    if type(to_email) == str:
        to_email = (to_email,)

    if type(to_email) in (list, tuple, set):
        to_email = to_email

    subject = "{} {}".format(SUBJECT_PREFIX, subject)
    msg = EmailMultiAlternatives(subject, txt_message, to=to_email)
    msg.attach_alternative(html_message, "text/html")
    msg.send()

    if type(to_email) in (list, tuple, set):
        log_obj = None
        for email in to_email:
            log_obj = email_log_service.log_email(email, subject, html_message, txt_message)
        return log_obj
    else:
        return email_log_service.log_email(to_email, subject, html_message, txt_message)

