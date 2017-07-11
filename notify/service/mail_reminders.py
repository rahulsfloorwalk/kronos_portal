import logging

from django.conf import settings
from django.template import Context
from django.template.loader import render_to_string, get_template
from django.core.mail import EmailMultiAlternatives

import audit_store.service as audit_store_service

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from manager import notification

from kronos.celery import app

from .mail import send_email

_logger = logging.getLogger(__name__)

@app.task(ignore_result=True)
def send_pre_audit_reminders():
    if not settings.EMAIL_SWITCH['PRE_REMINDER_EMAIL']:
        _logger.info("PRE reminder emails disabled.")
        return

    audit_stores = audit_store_service.find_for_pre_reminder()

    _logger.info("queueing PRE reminders for %s audit_stores",len(audit_stores))
    for audit_store in audit_stores:
        send_reminder_for_audit_store.delay(audit_store.id, "PRE")

    return len(audit_stores)

@app.task(ignore_result=True)
def send_on_audit_reminders():
    if not settings.EMAIL_SWITCH['ON_REMINDER_EMAIL']:
        _logger.info("ON reminder emails disabled.")
        return

    audit_stores = audit_store_service.find_for_on_reminder()

    _logger.info("queueing ON reminders for %s audit_stores",len(audit_stores))
    for audit_store in audit_stores:
        send_reminder_for_audit_store.delay(audit_store.id, "ON")

    return len(audit_stores)

@app.task(ignore_result=True)
def send_post_audit_reminders():
    if not settings.EMAIL_SWITCH['POST_REMINDER_EMAIL']:
        _logger.info("POST reminder emails disabled.")
        return

    audit_stores = audit_store_service.find_for_post_reminder()

    _logger.info("queueing POST reminders for %s audit_stores",len(audit_stores))
    for audit_store in audit_stores:
        send_reminder_for_audit_store.delay(audit_store.id, "POST")

    return len(audit_stores)


@app.task(ignore_result=True)
def send_reminder_for_audit_store(audit_store_id, reminder_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    params = {}

    params['to_email'] = audit_store.user.email
    params['first_name'] = audit_store.user.profileinfo.first_name
    params['last_name'] = audit_store.user.profileinfo.last_name
    params['audit_date'] = audit_store.audit_date
    params['client'] = audit_store.audit.audit_cycle.client.name
    params['store_name'] = audit_store.audit.store.name
    params['store_address'] = audit_store.audit.store.address
    params['audit_cycle_post_approval_description'] = audit_store.audit.audit_cycle.post_approval_description
    params['audit_post_approval_description'] = audit_store.audit.post_approval_description

    if reminder_type == "PRE":
        params['html_template'] = "notify/pre_reminder.html"
        params['txt_template'] = "notify/pre_reminder.txt"
        params['subject'] = "Don't forget your {} audit tomorrow".format(params['client'])
    elif reminder_type == "ON":
        params['html_template'] = "notify/on_reminder.html"
        params['txt_template'] = "notify/on_reminder.txt"
        params['subject'] = "We hope your {} audit went well".format(params['client'])
    elif reminder_type == "POST":
        params['html_template'] = "notify/post_reminder.html"
        params['txt_template'] = "notify/post_reminder.txt"
        params['subject'] = "Let's get this {} report filled.".format(params['client'])
    else:
        raise ValueError("invalid reminder_type: {}".format(reminder_type))

    html_message = get_template(params["html_template"]).render(Context(params))
    txt_message = get_template(params["txt_template"]).render(Context(params))

    send_email(params["to_email"], params['subject'], html_message, txt_message)
