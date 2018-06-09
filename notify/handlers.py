from django.contrib.auth.models import Group
from django.db import connection
from django.dispatch import receiver
from notifications.signals import notify
from notifications.models import Notification
from notify import verbs
from notify.service import mail_notify
from audit_store.signals import *
from audit_store.models import AuditStore

from registration.models import GROUP_NAME_MANAGER


@receiver(audit_store_status_change, dispatch_uid="notification_receiver")
def status_change_notification_callback(sender, **kwargs):
    user_actor = kwargs.get('user_actor')
    status = kwargs.get('status')
    old_status = kwargs.get('old_status')
    id = kwargs.get('id')
    audit_store = AuditStore.objects.get(pk=id)

    if status == AuditStore.ASSIGNED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ASSIGNED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ASSIGNED, audit_store, audit_store.audit)
    if status == AuditStore.ACKNOWLEDGED and old_status == AuditStore.ASSIGNED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ACKNOWLEDGED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ACKNOWLEDGED, audit_store, audit_store.audit)

    elif status == AuditStore.ACKNOWLEDGED and old_status == AuditStore.SUBMITTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_UNSUBMITTED, audit_store, audit_store.audit)
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
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_FAILED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_FAILED, audit_store, audit_store.audit)

    elif status == AuditStore.REJECTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_REJECTED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_REJECTED, audit_store, audit_store.audit)

    elif status == AuditStore.ACCEPTED:
        send_notification(user_actor, audit_store.user, verbs.AUDIT_STORE_ACCEPTED, audit_store, audit_store.audit)
        send_notification(user_actor, Group.objects.get(name=GROUP_NAME_MANAGER), verbs.AUDIT_STORE_ACCEPTED, audit_store, audit_store.audit)


def send_notification(user_actor, recipient, verb, action_object, target):

    notify.send(
        user_actor,
        recipient=recipient,
        verb=verb,
        action_object=action_object,
        target=target
    )
    notif_id = Notification.objects.filter(verb=verb).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))