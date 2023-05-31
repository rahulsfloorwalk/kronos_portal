import logging

from django.template.loader import get_template

from celery import shared_task

from .mail import send_email

from registration.context import registration_context

from audit_store.models import AuditStore

from auditor.service.profile_info_service import find_profile_info_by_user_id

_logger = logging.getLogger(__name__)


@shared_task(ignore_result=True)
def send_audit_report_concern_email(email_address, audit_store_id, user_id, message):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    client_name = audit_store.audit.audit_cycle.client.brand_name
    store_name = audit_store.audit.store.name + " " + audit_store.audit.store.city.name
    audit_store_id = audit_store.id
    user_profile_info = find_profile_info_by_user_id(user_id)
    auditor_name = user_profile_info.first_name + " " + user_profile_info.last_name
    auditor_mobile_number = user_profile_info.mobile_number
    auditor_email = user_profile_info.user.email
    params = {
        'client_name': client_name,
        'store_name': store_name,
        'audit_store_id': audit_store_id,
        'concern': message,
        'auditor_name': auditor_name,
        'auditor_mobile_number': auditor_mobile_number,
        'auditor_email': auditor_email,
        **registration_context(),
    }

    # generate email from templates
    subject = "Auditor has concern about the audit of - {} - {}".format(params['client_name'], params['store_name'])
    html_message = get_template("notify/auditor_report_concern_email.html").render(params)
    txt_message = get_template("notify/auditor_report_concern_email.txt").render(params)

    _logger.info("sending audit report concern email to : %s", email_address)
    send_email(email_address, subject, html_message, txt_message,auditor_email=params['auditor_email'])
    _logger.info("audit report concern email sent successfully to : %s", email_address)
