import logging
from django.conf import settings
from django.template.loader import get_template
from .mail import send_email
from django.contrib.auth.models import User
from kronos.celery import app
from celery.result import ResultSet
from audit_store.models import ReportActionPlan
from registration.context import registration_context
from client.models import ClientUser,Client
from client.service import client_service
from audit_store.models import AuditStore
from celery import shared_task

_logger = logging.getLogger(__name__)


@app.task(iqnore_result=True)
def auto_tattava_report_action_target_date_to_admin():
    client_id = 32 #hardcoded
    mail_count=0
    query_set = client_service.find_audit_store_by_client_id_for_target_date(client_id)
    if query_set:
        action_list=[]
        for i in query_set:
            report_action = client_service.report_action_by_audit_store_id(i)
            if report_action:
                for j in report_action:
                    action_list.append({
                        'person':j.person_responsible,
                        'description':j.action_plan_description,
                        'report_id':i
                    })
        if len(action_list)>0:
            _logger.info("sending email for action plan with %s Action Plans",len(action_list))
            mail_count+=1
            send_target_date_reminder.delay(action_list,client_id)
    return mail_count                
                
    
@shared_task()
def send_target_date_reminder(action_list,client_id):
    client_users = ClientUser.objects.filter(client_id=client_id,receive_email_notification=True)
    admin_client_users = [user.user.email for user in client_users if  user.user.has_perm('client.clientuser_admin') and user.user.is_active==True]
    params={
        **registration_context(),
    }
    subject = "Today Targeted Date of Action Plan for Store Manager Assignments Reminder"
    params['subject_text'] = subject
    params['action_list'] = action_list
    html_message = get_template("notify/tattava_target_date_email.html").render(params)
    txt_message = get_template("notify/tattava_target_date_email.txt").render(params)
    send_email(admin_client_users, subject, html_message, txt_message)