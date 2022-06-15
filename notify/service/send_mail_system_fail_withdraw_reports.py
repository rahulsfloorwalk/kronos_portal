import logging

from django.template.loader import get_template

from kronos.celery import app

from .mail import send_email

from registration.context import registration_context

from audit_store.models import AuditStore

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def send_audit_report_failed_withdraw_email(email_address, audit_store_id, status_type, user_type):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    client_name = audit_store.audit.audit_cycle.client.brand_name
    store_name = audit_store.audit.store.name + " " + audit_store.audit.store.city.name
    audit_store_id = audit_store.id
    params = {
        'client_name': client_name,
        'store_name': store_name,
        'audit_store_id': audit_store_id,
        **registration_context(),
    }

    if status_type == "fail" and user_type == "manager":
        # generate email from templates
        subject = "Audit Report Failed by System - {} - {}".format(params['client_name'], params['store_name'])
        html_message = get_template("notify/system_fail_email_manager.html").render(params)
        txt_message = get_template("notify/system_fail_email_manager.txt").render(params)

        _logger.info("sending audit report failed email to : %s", email_address)
        send_email(email_address, subject, html_message, txt_message)
        _logger.info("audit report failed email sent successfully to : %s", email_address)
    if status_type == "fail" and user_type == "auditor":
        # generate email from templates
        subject = "Audit Report Failed by System - {} - {}".format(params['client_name'], params['store_name'])
        html_message = get_template("notify/system_fail_email_auditor.html").render(params)
        txt_message = get_template("notify/system_fail_email_auditor.txt").render(params)

        _logger.info("sending audit report failed email to : %s", email_address)
        send_email(email_address, subject, html_message, txt_message)
        _logger.info("audit report failed email sent successfully to : %s", email_address)
    if status_type == "withdraw" and user_type == "manager":
        # generate email from templates
        subject = "Audit Report Withdraw by System - {} - {}".format(params['client_name'], params['store_name'])
        html_message = get_template("notify/system_withdraw_email_manager.html").render(params)
        txt_message = get_template("notify/system_withdraw_email_manager.txt").render(params)

        _logger.info("sending audit report withdraw email to : %s", email_address)
        send_email(email_address, subject, html_message, txt_message)
        _logger.info("audit report withdraw email sent successfully to : %s", email_address)
    if status_type == "withdraw" and user_type == "auditor":
        # generate email from templates
        subject = "Audit Report Withdraw by System - {} - {}".format(params['client_name'], params['store_name'])
        html_message = get_template("notify/system_withdraw_email_auditor.html").render(params)
        txt_message = get_template("notify/system_withdraw_email_auditor.txt").render(params)

        _logger.info("sending audit report withdraw email to : %s", email_address)
        send_email(email_address, subject, html_message, txt_message)
        _logger.info("audit report withdraw email sent successfully to : %s", email_address)


@app.task(ignore_result=True)
def send_audit_report_failed_email_for_auto_align(email_address, audit_store_id, status_type, user_type):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    client_name = audit_store.audit.audit_cycle.client.brand_name
    store_name = audit_store.audit.store.name + " " + audit_store.audit.store.city.name
    audit_store_id = audit_store.id
    params = {
        'client_name': client_name,
        'store_name': store_name,
        'audit_store_id': audit_store_id,
        **registration_context(),
    }

    if status_type == "fail" and user_type == "auditor":
        # generate email from templates
        subject = "Audit Report Failed by System - {} - {}".format(params['client_name'], params['store_name'])
        html_message = get_template("notify/system_fail_email_auditor_auto_align.html").render(params)
        txt_message = get_template("notify/system_fail_email_auditor_auto_align.txt").render(params)

        _logger.info("sending audit report failed email to : %s", email_address)
        send_email(email_address, subject, html_message, txt_message)
        _logger.info("audit report failed email sent successfully to : %s", email_address)