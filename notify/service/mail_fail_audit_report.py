import logging

from django.template.loader import get_template

from celery import shared_task

from .mail import send_email

from registration.context import registration_context

_logger = logging.getLogger(__name__)

@shared_task(ignore_result=True)
def send_audit_report_failed_email(email_address, audit_store):
    client_name = audit_store.audit.audit_cycle.client.brand_name
    store_name = audit_store.audit.store.name + " " + audit_store.audit.store.city.name
    audit_store_id = audit_store.id
    params = {
        'client_name': client_name,
        'store_name': store_name,
        'audit_store_id': audit_store_id,
        **registration_context(),
    }

    # generate email from templates
    subject = "Audit Report Failed by Auditor - {} - {}".format(params['client_name'], params['store_name'])
    html_message = get_template("notify/auditor_failed_email.html").render(params)
    txt_message = get_template("notify/auditor_failed_email.txt").render(params)

    _logger.info("sending welcome email to : %s", email_address)
    send_email(email_address, subject, html_message, txt_message)
    _logger.info("welcome email sent successfully to : %s", email_address)
