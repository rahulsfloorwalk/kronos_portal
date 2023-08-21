import logging
from django.conf import settings
from django.template.loader import get_template
from .mail import send_email
from django.contrib.auth.models import User
from kronos.celery import app
from celery.result import ResultSet
from audit_store.models import ReportActionPlan
from registration.context import registration_context
from client.models import ClientUser
from client.service import client_service
from audit_store.models import AuditStore
from celery import shared_task

_logger = logging.getLogger(__name__)

from datetime import datetime, timedelta
from django.utils import timezone


@app.task(iqnore_result=True)
def auto_tattva_report_action_target_date_to_admin():
    client_id = 32 #hardcoded
    mail_count=0
    query_set = AuditStore.objects.filter(
            audit__audit_cycle__client_id=client_id
        ).select_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city') \
        .prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city')
    if query_set:
        for i in query_set:
            report_action=ReportActionPlan.objects.filter(target_date=timezone.now().date(),status=ReportActionPlan.PENDING,audit_store_id=i.id)
            if report_action:
                for j in report_action:
                    mail_count+=1
                    _logger.info("sending email for action plan to user %s",j.person_responsible)
                    send_target_date_reminder.delay(j.person_responsible,j.target_date,client_id)
    return mail_count                
                
    
@shared_task()
def send_target_date_reminder(person,target_date,client_id):
    client_users = ClientUser.objects.filter(client_id=client_id,receive_email_notification=True)
    admin_client_users = [user.user.email for user in client_users if  user.user.has_perm('client.clientuser_admin')]
    client_user= client_service.find_client_user_full_name_and_email(person)
    params={
        'person':person,
        'last_login':client_user.user.last_login,
        'person_full_name':client_user.full_name,
        'target_date':target_date,
        **registration_context(),
    }
    subject = "Targeted Date of Action Plan for Store Manager Assignments"
    html_message = get_template("notify/tattava_target_date_email.html").render(params)
    txt_message = get_template("notify/tattava_target_date_email.txt").render(params)
    send_email(admin_client_users, subject, html_message, txt_message)