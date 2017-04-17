import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMessage

from celery import shared_task

import strings

_logger = logging.getLogger(__name__)

@shared_task(ignore_result=True)
def send_welcome_email(email_address):
        message = get_template('registration/welcome_mail.html').render(Context({
            'protocol': 'http',
            'email': email_address,
            'foo': 'bar'
        }))

        msg = EmailMessage( strings.WELCOME_SUBJECT, message, to=(email_address,))
        msg.content_subtype = 'html'
        _logger.info("sending welcome email to : %s", email_address)
        msg.send()
        _logger.info("welcome email sent successfully to : %s", email_address)
