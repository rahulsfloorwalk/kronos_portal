from django.db import connection
from django.db.transaction import atomic
from django.contrib.auth.models import Group
from notifications.signals import notify
from notifications.models import Notification

from manager.notification import verbs
from manager import notification

from notify.service import mail_notify
from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR

from manager.notification import verbs

@atomic
def approve(application_id, audit_date, user_actor):
    try:
        application = AuditApplication.objects.get(id=application_id)
        audit = application.audit
        audit_cycle = audit.audit_cycle
    except (AuditApplication.DoesNotExist, Audit.DoesNotExist, AuditCycle.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if application.status != AuditApplication.APPLIED:
        raise AppLogicError("application cannot be approved right now")
    if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
        raise AppLogicError("audit date is out of range")
    if audit_cycle.status == AuditCycle.ARCHIVED:
        raise AppLogicError("audit_cycle is archived")

    application.status = AuditApplication.APPROVED
    application.audit_date = audit_date
    application.save()
    #TODO:VERB should be encapsulated
    notify.send(
        user_actor,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_APPLICATION_APPROVED',
        action_object=application,
        target=application.audit
    )
    notify.send(
            user_actor,
            recipient=application.profileinfo.user,
            verb='AUDIT_APPLICATION_APPROVED',
            action_object=application,
            target=application.audit
    )

    audit_store = AuditStore()
    audit_store.audit_id = audit.id
    audit_store.audit_date = application.audit_date
    audit_store.status = AuditStore.ASSIGNED
    audit_store.user_id = application.profileinfo.user_id

    audit_store.save()
    #TODO:VERB should be encapsulated
    notify.send(
        user_actor,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_STORE_ASSIGNED',
        action_object=audit_store,
        target=audit_store.audit
    )
    manager_notif_id = Notification.objects.filter(verb=notification.AUDIT_STORE_ASSIGNED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
    notify.send(
            user_actor,
            recipient=audit_store.user,
            verb='AUDIT_STORE_ASSIGNED',
            action_object=audit_store,
            target=audit_store.audit
    )
    auditor_notif_id = Notification.objects.filter(verb=notification.AUDIT_STORE_ASSIGNED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
    return application

@atomic
def reject(application_id, user_actor):
    try:
        application = AuditApplication.objects.get(id=application_id)
        audit = application.audit
        audit_cycle = audit.audit_cycle
    except (AuditApplication.DoesNotExist, Audit.DoesNotExist, AuditCycle.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if application.status != AuditApplication.APPLIED:
        raise AppLogicError("application cannot be rejected now")

    application.status = AuditApplication.REJECTED
    application.save()
    #TODO:VERB should be encapsulated
    notify.send(
        user_actor,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_APPLICATION_REJECTED',
        action_object=application,
        target=application.audit
    )
    manager_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_REJECTED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
    notify.send(
            user_actor,
            recipient=application.profileinfo.user,
            verb='AUDIT_APPLICATION_REJECTED',
            action_object=application,
            target=application.audit
    )
    auditor_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_REJECTED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
    return application

def find_by_audit(audit_id):
    try:
        applications = []
        for al in Audit.objects.get(id=audit_id).auditlocations.all():
            for app in al.applications.all():
                applications.append(app)
        return applications
    except Audit.DoesNotExist:
        raise ObjectNotFound
