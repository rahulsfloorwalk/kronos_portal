from django.core.mail import EmailMultiAlternatives

SUBJECT_PREFIX = "[FloorWalk]"

def send_email(to_email, subject, html_message, txt_message):
    "prepends a [FloorWalk] to the subject and sends an email containing both the HTML and plain text versions to to_email"

    subject = "{} {}".format(SUBJECT_PREFIX, subject)
    msg = EmailMultiAlternatives( subject, txt_message, to=(to_email,))
    msg.attach_alternative(html_message, "text/html")
    msg.send()
