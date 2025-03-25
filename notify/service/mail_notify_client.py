import logging

from kronos.celery import app
from .mail import send_email
from django.template.loader import get_template
from registration.context import registration_context

from audit_store.service_client import find_today_client_review_status_reports, find_audit_store_exclude_today
from audit.service.audit_cycle_client_service import find_all_client_with_active_report_and_clearing_audit_cycle_status
from client.service.client_service import find_client_by_id
from client.service.client_user import find_client_admin_users_by_client_id
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import now, timedelta
from audit.models import AuditCycle
from questionnaire.models import Question
_logger = logging.getLogger(__name__)

# from notify.service import mail_notify_client
# obj=mail_notify_client
# obj.send_mail_to_client()

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
    # client_obj = find_client_by_id(client_id)
    client_users_email = find_client_admin_users_by_client_id(client_id).filter(receive_email_notification=True).values_list('user__email', flat=True)
    to_email = list()
    for i in client_users_email:
        to_email.append(i)
    subject = "{} report is live today".format(str(len(report_list)))
    if len(report_list) > 1:
        subject = "{} reports are live today".format(str(len(report_list)))
    params['subject_text'] = subject
    params['report_list'] = report_list
    html_message = get_template("notify/client_notify_report_email.html").render(params)
    txt_message = get_template("notify/client_notify_report_email.txt").render(params)
    send_email(to_email, subject, html_message, txt_message)



# def trigger_mark_loss_email_if_consistent():
#     # Get the start of the current week (Monday)
#     start_of_week = now().date() - timedelta(days=now().weekday())

#     audit_cycles = AuditCycle.objects.filter(
#         status="clearing",
#         modified_at__date__gte=start_of_week,
#         mark_loss_email_sent=False
#     ).order_by('-end_date')

#     for audit_cycle in audit_cycles:
#         store = audit_cycle.audits.first().store

#         recent_audit_cycles = AuditCycle.objects.filter(
#             audits__store=store
#         ).order_by('-end_date')[:3]

#         if len(recent_audit_cycles) < 3:
#             continue 

#         question_sets = [
#             set(Question.objects.filter(section__audit_cycle=a_cycle)
#                 .values_list('id', flat=True))
#             for a_cycle in recent_audit_cycles
#         ]

#         common_questions = set.intersection(*question_sets)
#         loss_questions = []

#         for question_id in common_questions:
#             scores = []
#             max_marks = None

#             for a_cycle in recent_audit_cycles:
#                 question_data = get_question_wise_marks_for_audit_cycle(a_cycle.id, store.id)
#                 for q_data in question_data:
#                     if q_data["question_id"] == question_id:
#                         scores.append(q_data["score"]["marks"])
#                         max_marks = q_data["max_marks"]

#             if all(score is not None and score < max_marks for score in scores):
#                 loss_questions.append({
#                     "question_id": question_id,
#                     "question_txt": Question.objects.get(id=question_id).question_txt,
#                     "max_marks": max_marks,
#                     "obtained_marks": scores
#                 })

#         if loss_questions:
#             subject = "{} reports are live today".format(str(len(report_list)))
#             params['subject_text'] = subject
#             params['report_list'] = report_list
#             html_message = get_template("notify/client_notify_report_email.html").render(params)
#             txt_message = get_template("notify/client_notify_report_email.txt").render(params)
#             send_email(to_email, subject, html_message, txt_message)
