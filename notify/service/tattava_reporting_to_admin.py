import logging
from django.db.transaction import atomic
from django.conf import settings
from django.template.loader import get_template
from .mail import send_email
from registration.models import GROUP_NAME_AUDITOR
from kronos.celery import app
from django.db.models import Subquery,OuterRef
from celery.result import ResultSet
from registration.context import registration_context
from client.models import ClientUser,NonClientAdminUserStore
from audit_store.models import AuditStore
from celery import shared_task
from audit.models import AuditCycle
_logger = logging.getLogger(__name__)


@app.task(iqnore_result=True)
def auto_tattava_reporting_to_admin_after_48_hour_not_logged_in_non_admin_client_user():
    client_id = 32  # Hardcoded
    mail_count=0
    query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=(AuditCycle.ACTIVE,AuditCycle.REPORT,AuditCycle.CLEARING),
            audit__audit_cycle__client_id=client_id,
            status=AuditStore.COMPLETED,
        ).select_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city') \
        .prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').values_list('audit__store__id','modified_at')
    data=[]
    seen_email=set()
    if query_set:
        for i in query_set:
            store_id, modified_at = i
            check_users = NonClientAdminUserStore.objects.filter(stores__store_list__contains=store_id).distinct('client_user') \
            .select_related('client_user__user') \
            .values('client_user__full_name','client_user__user__email','client_user__user__last_login')
            if check_users:
                for j in check_users:
                    email = j['client_user__user__email']
                    if j['client_user__user__last_login'] is None or ( (j['client_user__user__last_login'].date() - modified_at.date()).days == 3):
                        if email not in seen_email:
                            seen_email.add(email)
                            data.append({'full_name':j['client_user__full_name'],'last_login':j['client_user__user__last_login'],'email':email})
        if data:
            mail_count+=1
            _logger.info("sending email for %s inactive client store manager",len(data))
            send_store_manager_inactive_mail.delay(data,client_id)
    return mail_count            


@shared_task()  
def send_store_manager_inactive_mail(data,client_id):
    client_users = ClientUser.objects.filter(client_id=client_id,receive_email_notification=True)
    admin_client_users = [user.user.email for user in client_users if  user.user.has_perm('client.clientuser_admin')]
    params={
        **registration_context(),
    }
    subject = "Report Review : No Login Activity | FloorWalk"
    params['subject_text'] = subject
    params['data'] = data
    html_message = get_template("notify/tattava_store_manager_inactive_email.html").render(params)
    txt_message = get_template("notify/tattava_store_manager_inactive_email.txt").render(params)
    send_email(admin_client_users, subject, html_message, txt_message)
    