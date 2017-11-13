import logging

from django.conf import settings
from django.template import Context
from django.template.loader import get_template

from celery import shared_task

from .mail import send_email

_logger = logging.getLogger(__name__)

@shared_task(ignore_result=True)
def send_welcome_email(email_address):
    params = {
        'kronos_protocol': 'https',
        'kronos_domain': settings.BASE_DOMAIN_NAME,
        'email': email_address,
    }

    # generate email from templates
    subject = "Welcome to FloorWalk! We're excited to have you onboard!"
    html_message = get_template("registration/welcome_mail.html").render(Context(params))
    txt_message = get_template("registration/welcome_mail.txt").render(Context(params))

    _logger.info("sending welcome email to : %s", email_address)
    send_email(email_address, subject, html_message, txt_message)
    _logger.info("welcome email sent successfully to : %s", email_address)
