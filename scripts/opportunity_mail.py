import logging

from django.contrib.auth.models import User
from django.template.loader import get_template

from registration.models import GROUP_NAME_AUDITOR
from notify.service.mail import send_email

from kronos.celery import app

_logger = logging.getLogger(__name__)

def AuditorOpportunityEmail(start = 0, end = 0):
    auditor_list = User.objects.filter(id__range = (start, end), groups__name=GROUP_NAME_AUDITOR, is_active = True, preferences__receive_new_opportunities_email = True)

    for auditor in auditor_list:
        send_opportunity_email(auditor.email)

    _logger.info("scheduled %s emails for Insurance dekho opportunity", auditor_list.count(),)


@app.task(ignore_result=True)
def send_opportunity_email(email):
    subject = "Exciting Opportunity with FloorWalk - Earn upto 30% commission"
    html_message = get_template("notify/full_time_opportunity_email.html").render()
    txt_message = get_template("notify/full_time_opportunity_email.txt").render()

    send_email(email, subject, html_message, txt_message)