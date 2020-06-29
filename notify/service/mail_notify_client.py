import logging

from celery import shared_task
from .mail import send_email
from django.template.loader import get_template
from registration.context import registration_context

from audit_store.service_client import find_today_client_review_status_reports
from audit.service.audit_cycle_client_service import find_all_client_with_active_and_archived_audit_cycle_status
from client.service.client_service import find_client_by_id
_logger = logging.getLogger(__name__)


@shared_task(ignore_result=True)
def send_mail_to_client():
    client_id_list = find_all_client_with_active_and_archived_audit_cycle_status()
    for client_id in client_id_list:
        client_review_reports = find_today_client_review_status_reports(client_id)
        # print("client_review_reports", client_review_reports)
        if client_review_reports:
            client_obj = find_client_by_id(client_id)
            to_email = client_obj.email
            subject = "{} report is in Client Review".format(str(client_review_reports.count()))
            if client_review_reports.count() > 1:
                subject = "{} reports is in Client Review".format(str(client_review_reports.count()))
            params = {
                **registration_context(),
            }
            report_list = []
            for reports in client_review_reports:
                store_details = reports.audit_store.audit.store
                report_list.append(
                    {
                        'audit_store_id': str(reports.audit_store_id),
                        'audit_cycle_name': reports.audit_store.audit.audit_cycle.name,
                        'store_details': store_details.name + ", " + store_details.address + ", " + store_details.city.name
                    }
                )
            params['report_count'] = str(len(report_list))
            params['report_list'] = report_list
            html_message = get_template("notify/client_notify_report_email.html").render(params)
            txt_message = get_template("notify/client_notify_report_email.txt").render(params)
            # print("subject", subject)
            # print("html_message", html_message)
            send_email(to_email, subject, html_message, txt_message)
