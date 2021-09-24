import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.template.loader import get_template

from kronos.exceptions import ObjectNotFound

from auditor.models import Preferences
from registration.models import GROUP_NAME_AUDITOR
from registration.service.auditor import find_auditor_by_id
from auditor.service.preferences_service import find_preferences_by_user_id

from celery.result import ResultSet
from kronos.celery import app

from .mail import send_email

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def send_full_time_opportunity_emails():
    auditor_list = User.objects.filter(groups__name=GROUP_NAME_AUDITOR, is_active = True, preferences__receive_new_opportunities_email = True, preferences__full_time_opportunity_email_status = False).values_list('id', flat = True)[:100]

    if not auditor_list:
        _logger.warn("FullTimeOpportunityEmailRecord NOT FOUND")

    async_results = ResultSet([])
    for auditor in auditor_list:
        if settings.EMAIL_SWITCH['OPPORTUNITY_EMAIL']:
            async_results.add(full_time_opportunity_email_task.delay(auditor))
        else:
            _logger.info("opportunity email disabled. skipping full time opportunity email")

    _logger.info("scheduled %s emails for full time opportunity", len(async_results))


@app.task()
def full_time_opportunity_email_task(user_id):
    try:
        user = find_auditor_by_id(user_id)
    except ObjectNotFound as e:
        _logger.warn("auditor with user_id: %s NOT FOUND", user_id)
        return False

    try:
        if not user.is_active or not user.preferences.receive_new_opportunities_email:
            return False
    except Preferences.DoesNotExist as e:
        return False

    subject = "Exciting Opportunity with FloorWalk - Earn upto 30% commission"
    html_message = get_template("notify/full_time_opportunity_email.html").render()
    txt_message = get_template("notify/full_time_opportunity_email.txt").render()

    send_email(user.email, subject, html_message, txt_message)

    prefs = find_preferences_by_user_id(user_id)
    prefs.full_time_opportunity_email_status = True
    prefs.save()
    return True