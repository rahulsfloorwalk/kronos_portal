from time import sleep

from django.template import Context
from django.template.loader import render_to_string, get_template
from django.core.mail import EmailMultiAlternatives

from notifications.models import Notification

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from manager import notification

from celery import shared_task

#notif action object has AuditApplication
#notif recipient has User
#notif target has Audit
@shared_task(ignore_result=True)
def send_notification_mail(notif_id):
    sleep(2)
    print(notif_id)
    notif = Notification.objects.get(pk=notif_id)
    if notif.recipient.groups.filter(name=GROUP_NAME_MANAGER).all():
        print("send notification to manager")
    elif notif.recipient.groups.filter(name=GROUP_NAME_AUDITOR).all():
        to_email = notif.recipient.email
        to_name = notif.recipient.profileinfo.first_name
        audit_date = notif.action_object.audit_date
        client = notif.action_object.audit.audit_cycle.client.name
        store_name = notif.action_object.audit.store.name
        store_address = notif.action_object.audit.store.address

        if notif.verb == notification.AUDIT_APPLICATION_APPLIED:
            subject = "[FloorWalk] Audit Application"
            html_message = get_template('notify/application_email.html').render(Context({
                'name': to_name,
                'audit_date': audit_date,
                'client': client,
                'store_name': store_name,
                'store_address': store_address
            }))
            txt_message = get_template('notify/application_email.txt').render(Context({
                'name': to_name,
                'audit_date': audit_date,
                'client': client,
                'store_name': store_name,
                'store_address': store_address
            }))
            _send_mail(to_email, subject, html_message, txt_message)
        elif notif.verb == notification.AUDIT_APPLICATION_CANCELED:
            subject = "[FloorWalk] Audit Cancelled"
            html_message = get_template('notify/cancel_email.html').render(Context({
                'name': to_name,
                'audit_date': audit_date,
                'client': client,
                'store_name': store_name,
                'store_address': store_address
            }))
            txt_message = get_template('notify/cancel_email.txt').render(Context({
                'name': to_name,
                'audit_date': audit_date,
                'client': client,
                'store_name': store_name,
                'store_address': store_address
            }))
            _send_mail(to_email, subject, html_message, txt_message)

def _send_mail(email, subject, html_message, txt_message):

    msg = EmailMultiAlternatives( subject, txt_message, to=(email,))
    msg.attach_alternative(html_message, "text/html")
    msg.send()
