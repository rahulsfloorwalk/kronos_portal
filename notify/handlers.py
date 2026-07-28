from django.contrib.auth.models import Group
from django.db import connection
from django.dispatch import receiver
from notifications.signals import notify
from notifications.models import Notification
from notify import verbs
from notify.service import mail_notify
from notify.service import message_notify
from audit_store.signals import audit_store_status_change
from audit_store.models import AuditStore
from attachment.models import Attachment
from registration.models import GROUP_NAME_MANAGER

from kronos.exceptions import ObjectNotFound

# def find_by_audit_cycle(audit_cycle_id):
#     try:
#         return Attachment.objects.get(audit_cycles__id=audit_cycle_id,status=Attachment.ATTACHED)
#     except Attachment.DoesNotExist as e:
#         return None

def find_by_audit_cycle(audit_cycle_id):
    attachment = Attachment.objects.filter(audit_cycles__id=audit_cycle_id,status=Attachment.ATTACHED,attachment_category=Attachment.GUIDELINE,mime_type='application/pdf').first()
    if attachment:
        return attachment
    return Attachment.objects.filter(audit_cycles__id=audit_cycle_id,status=Attachment.ATTACHED,attachment_category__isnull=True,mime_type='application/pdf').first()
        
    
@receiver(audit_store_status_change, dispatch_uid="status_change_notification_callback")
def status_change_notification_callback(sender, **kwargs):
    user_actor = kwargs['user_actor']
    status = kwargs['status']
    old_status = kwargs['old_status']
    audit_store = kwargs['audit_store']
    message = kwargs['message'] if 'message' in kwargs else ''

    if status == AuditStore.ASSIGNED:
        pdf=  find_by_audit_cycle(audit_store.audit.audit_cycle.id)
        if pdf:
            if pdf.generate_presigned_url():
                send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ASSIGNED_PDF, audit_store, audit_store.audit)
                send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ASSIGNED_PDF, audit_store, audit_store.audit)
        else:
            send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ASSIGNED, audit_store, audit_store.audit)
            send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ASSIGNED, audit_store, audit_store.audit)
    if status == AuditStore.ACKNOWLEDGED and old_status == AuditStore.ASSIGNED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ACKNOWLEDGED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ACKNOWLEDGED, audit_store, audit_store.audit)

    elif status == AuditStore.ACKNOWLEDGED and old_status == AuditStore.SUBMITTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_UNSUBMITTED, audit_store, audit_store.audit, message)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_UNSUBMITTED, audit_store, audit_store.audit)

    elif status == AuditStore.SUBMITTED and old_status == AuditStore.ACKNOWLEDGED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_SUBMITTED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_SUBMITTED, audit_store, audit_store.audit)

    elif status == AuditStore.COMPLETED and old_status == AuditStore.PM_REVIEW:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_COMPLETED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_COMPLETED, audit_store, audit_store.audit)

    elif status == AuditStore.WITHDRAWN:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_WITHDRAWN, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_WITHDRAWN, audit_store, audit_store.audit)

    elif status == AuditStore.FAILED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_FAILED, audit_store, audit_store.audit, message)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_FAILED, audit_store, audit_store.audit, message)

    elif status == AuditStore.REJECTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_REJECTED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_REJECTED, audit_store, audit_store.audit)

    elif status == AuditStore.ACCEPTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ACCEPTED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ACCEPTED, audit_store, audit_store.audit)


def send_notification(user_actor, recipient, verb, action_object, target, message=""):

    notify.send(
        user_actor,
        recipient=recipient,
        verb=verb,
        action_object=action_object,
        target=target
    )
    notif_id = Notification.objects.filter(verb=verb).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id, message))
    # connection.on_commit(lambda: message_notify.send_notification_message(notif_id))
    connection.on_commit(lambda: message_notify.send_whatsapp_notification(notif_id, message))
