import logging

from kronos.celery import app
from .mail import send_email
from django.template.loader import get_template
from registration.context import registration_context

from audit_store.service_client import find_today_client_review_status_reports, find_audit_store_exclude_today
from audit.service.audit_cycle_client_service import find_all_client_with_active_report_and_clearing_audit_cycle_status
from client.service.client_service import find_client_by_id
_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def send_mail_to_client():
    client_id_list = find_all_client_with_active_report_and_clearing_audit_cycle_status()
    mail_count = 0
    for client_id in client_id_list:
        client_review_reports = find_today_client_review_status_reports(client_id)
        if client_review_reports:
            report_list = []
            for reports in client_review_reports:
                if not find_audit_store_exclude_today(reports.audit_store.id):
                    store_details = reports.audit_store.audit.store
                    report_list.append(
                        {
                            'audit_store_id': str(reports.audit_store_id),
                            'audit_cycle_name': reports.audit_store.audit.audit_cycle.name,
                            'store_details': store_details.name + ", " + store_details.city.name
                        }
                    )
                    mail_count += 1
            if len(report_list) > 0:
                _logger.info("sending email with %s audit_stores report", len(report_list))
                send_live_report_mail.delay(client_id, report_list)
    return mail_count


@app.task(ignore_result=True)
def send_live_report_mail(client_id, report_list):
    params = {
        **registration_context(),
    }
    client_obj = find_client_by_id(client_id)
    to_email = client_obj.email
    subject = "{} report is live today".format(str(len(report_list)))
    if len(report_list) > 1:
        subject = "{} reports are live today".format(str(len(report_list)))
    params['subject_text'] = subject
    params['report_list'] = report_list
    html_message = get_template("notify/client_notify_report_email.html").render(params)
    txt_message = get_template("notify/client_notify_report_email.txt").render(params)
    send_email(to_email, subject, html_message, txt_message)
