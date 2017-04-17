from time import sleep

from django.template import Context
from django.template.loader import render_to_string, get_template
from django.core.mail import EmailMultiAlternatives

from notifications.models import Notification

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from manager import notification

from celery import shared_task

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

        if notif.verb == notification.AUDIT_APPLICATION_APPLIED:
            subject = "[FloorWalk] Audit Application"
            html_message = get_template('notify/application_email.html').render(Context({
                'name': to_name,
            }))
            txt_message = get_template('notify/application_email.txt').render(Context({
                'name': to_name,
            }))
            _send_mail(to_email, subject, html_message, txt_message)
        elif notif.verb == notification.AUDIT_APPLICATION_CANCELED:
            subject = "[FloorWalk] Audit Cancelled"
            html_message = get_template('notify/cancel_email.html').render(Context({
                'name': to_name,
            }))
            txt_message = get_template('notify/cancel_email.txt').render(Context({
                'name': to_name,
            }))
            _send_mail(to_email, subject, html_message, txt_message)

def _send_mail(email, subject, html_message, txt_message):

    msg = EmailMultiAlternatives( subject, txt_message, to=(email,))
    msg.attach_alternative(html_message, "text/html")
    msg.send()

    # user = notification.recipient
    # if user.groups.get(name=GROUP_NAME_MANAGER):
    #     print("notify manager")
    # elif user.groups.get(name=GROUP_NAME_AUDITOR):
    #     print("notify auditor")
    # print(notification.target)
    # print(type(notification.recipient))
    # print(notification.verb)
    # print(notification.action_object)
