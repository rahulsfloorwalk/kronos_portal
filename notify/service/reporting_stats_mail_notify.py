import logging

from kronos.celery import app
from .mail import send_email
from django.template.loader import get_template
from django.conf import settings

from audit.service.audit_cycle_client_service import find_all_active_audit_cycle

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def reporting_stats_send_mail():
    stats_list = []
    if settings.EMAIL_SWITCH['REPORTING_STATS_EMAIL']:
        audit_cycle_list = find_all_active_audit_cycle()
        for audit_cycle in audit_cycle_list:
            stats_list.append(
                {
                    'client_name': audit_cycle.client.brand_name,
                    'audit_cycle_name': audit_cycle.name,
                    'total_count': audit_cycle.audit_count(),
                    'completed_count': audit_cycle.completed_audit_count(),
                    'completed_percentage': round(audit_cycle.completed_percentage(), 2)
                }
            )
        if len(stats_list) > 0:
            stats_list = sorted(stats_list, key=lambda i: i['completed_percentage'], reverse=True)
            _logger.info("sending reporting stats email with %s audit cycle", len(stats_list))
            email = settings.REPORTING_EMAIL_LIST
            if ";" in email:
                email_list = email.split(";")
                for e in email_list:
                    send_reporting_stats_mail.delay(e, stats_list)
            else:
                send_reporting_stats_mail.delay(email, stats_list)
    else:
        _logger.info("REPORTING_STATS_EMAIL is disabled, skipping email for reporting stats")
    return len(stats_list)


@app.task(ignore_result=True)
def send_reporting_stats_mail(to_email, stats_list):
    subject = "Today's Reporting Stats"
    params = {'stats_list': stats_list}
    html_message = get_template("notify/reporting_stats_notify_email.html").render(params)
    txt_message = get_template("notify/reporting_stats_notify_email.txt").render(params)
    send_email(to_email, subject, html_message, txt_message)
