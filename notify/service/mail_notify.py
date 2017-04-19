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
        params = {}
        params['to_name'] = notif.recipient.profileinfo.first_name
        params['audit_date'] = notif.action_object.audit_date
        params['client'] = notif.action_object.audit.audit_cycle.client.name
        params['store_name'] = notif.action_object.audit.store.name
        params['store_address'] = notif.action_object.audit.store.address

        if notif.verb == notification.AUDIT_APPLICATION_APPLIED:
            subject = "[FloorWalk] Audit Application"
            params['html_template'] = 'notify/application_email.html'
            params['txt_template'] = 'notify/application_email.txt'

        elif notif.verb == notification.AUDIT_APPLICATION_CANCELED:
            subject = "[FloorWalk] Audit Cancelled"
            params['html_template'] = 'notify/cancel_email.html'
            params['txt_template'] = 'notify/cancel_email.txt'

        elif notif.verb == notification.AUDIT_STORE_FIAT_ASSIGNED:
            subject = "[FloorWalk] Audit Assigned"
            params['html_template'] = 'notify/fiat_assign_email.html'
            params['txt_template'] = 'notify/fiat_assign_email.txt'

        elif notif.verb == notification.AUDIT_STORE_ASSIGNED:
            subject = "[FloorWalk] Audit Assigned"
            params['html_template'] = 'notify/assign_email.html'
            params['txt_template'] = 'notify/assign_email.txt'

        elif notif.verb == notification.AUDIT_APPLICATION_REJECTED:
            subject = "[FloorWalk] Audit Application Rejected"
            params['html_template'] = 'notify/reject_email.html'
            params['txt_template'] = 'notify/reject_email.txt'

        elif notif.verb == notification.AUDIT_STORE_WITHDRAWN:
            subject = "[FloorWalk] Audit Withdrawn"
            params['html_template'] = 'notify/withdrawn_email.html'
            params['txt_template'] = 'notify/withdrawn_email.txt'

        elif notif.verb == notification.AUDIT_STORE_SUBMITTED:
            subject = "[FloorWalk] Audit Report Submitted"
            params['html_template'] = 'notify/submitted_email.html'
            params['txt_template'] = 'notify/submitted_email.txt'

        elif notif.verb == notification.AUDIT_STORE_UNSUBMITTED:
            subject = "[FloorWalk] Audit Report Unsubmitted"
            params['html_template'] = 'notify/unsubmitted_email.html'
            params['txt_template'] = 'notify/unsubmitted_email.txt'

        elif notif.verb == notification.AUDIT_STORE_COMPLETED:
            subject = "[FloorWalk] Audit Report Completed"
            params['html_template'] = 'notify/completed_email.html'
            params['txt_template'] = 'notify/completed_email.txt'

        elif notif.verb == notification.AUDIT_STORE_FAILED:
            subject = "[FloorWalk] Audit Failed"
            params['html_template'] = 'notify/failed_email.html'
            params['txt_template'] = 'notify/failed_email.txt'

        html_message, txt_message = _prepare_mail(params)
        _send_mail(to_email, subject, html_message, txt_message)

def _prepare_mail(params):
    html_message = get_template(params.get('html_template')).render(Context({
        'name': params.get('to_name'),
        'audit_date': params.get('audit_date'),
        'client': params.get('client'),
        'store_name': params.get('store_name'),
        'store_address': params.get('store_address')
    }))
    txt_message = get_template(params.get('txt_template')).render(Context({
        'name': params.get('to_name'),
        'audit_date': params.get('audit_date'),
        'client': params.get('client'),
        'store_name': params.get('store_name'),
        'store_address': params.get('store_address')
    }))

    return html_message, txt_message

def _send_mail(email, subject, html_message, txt_message):

    msg = EmailMultiAlternatives( subject, txt_message, to=(email,))
    msg.attach_alternative(html_message, "text/html")
    msg.send()
