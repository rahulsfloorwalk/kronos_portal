import logging
from django.template.loader import get_template
from .mail import send_email
from kronos.celery import app
from registration.context import registration_context
from celery import shared_task
from audit_store.service_client import find_yesterday_client_review_status_reports,find_audit_store_completed_yesterday
_logger = logging.getLogger(__name__)

@app.task(iqnore_result=True)
def auto_tattava_mail_for_last_day_completed_report():
    client_id = 157 #hardcoded
    client_review_reports = find_yesterday_client_review_status_reports(client_id)
    mail_count=0
    if client_review_reports:
        report_list = []
        for reports in client_review_reports:
            if not find_audit_store_completed_yesterday(reports.audit_store.id):
                store_details = reports.audit_store.audit.store
                report_list.append(
                    {
                        'audit_store_id': str(reports.audit_store_id),
                        'audit_cycle_name': reports.audit_store.audit.audit_cycle.name,
                        'store_details': store_details.name + ", " + store_details.city.name
                    }
                )
                mail_count+=1
        if len(report_list) > 0:
            _logger.info("sending email with %s audit_stores report", len(report_list))
            tattava_send_live_report_mail.delay(report_list)
    return mail_count
    
    
@app.task(iqnore_result=True)
def tattava_send_live_report_mail(report_list):
    params={
        **registration_context(),
    }
    to_email=[
        'sumit.kumar@tattvaspa.org',
        'prem.choudhary@tattvaspa.com',
        'karan@tattvaspa.com',
        'vinay.singh@tattvaspa.org',
        'komal@tattvaspa.org',
        'rashmi@tattvaspa.com',
        'praveen.limadiya@tattvaspa.com',
        'naman@tattvaspa.org',
        'shipra@tattvaspa.com'
        ]
    # to_email=['arpan.patidar@floorwalk.in']
    subject = "{} report is live".format(str(len(report_list)))
    if len(report_list) > 1:
        subject = "{} reports are live".format(str(len(report_list)))
    params['subject_text'] = subject
    params['report_list'] = report_list
    html_message = get_template("notify/tattava_client_notify_report_email.html").render(params)
    txt_message = get_template("notify/tattava_client_notify_report_email.txt").render(params)
    send_email(to_email, subject, html_message, txt_message)