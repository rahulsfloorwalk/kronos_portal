from django.contrib.auth.models import Group
from django.db import connection
from django.db.transaction import atomic
from django.db.models import Count
from notifications.models import Notification
from notifications.signals import notify

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from auditor.models import AuditApplication, ProfileInfo, BankInfo, AdditionalInfo
from kronos.exceptions import ObjectNotFound, AppLogicError
from manager import notification
from notify.service import mail_notify
from registration.models import GROUP_NAME_MANAGER
from audit.service import audit_service
from audit.service import audit_cycle as audit_cycle_service


def get_applications( profileinfo_id):
    return AuditApplication.objects.filter(profileinfo_id=profileinfo_id)

def get_application( audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        return audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditApplication.DoesNotExist) as e:
        raise ObjectNotFound from e

@atomic
def apply( audit_id, profileinfo_id, audit_date):
    try:
        audit = Audit.objects.get(id=audit_id)
        profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, ProfileInfo.DoesNotExist) as e:
        raise ObjectNotFound from e
    except AuditApplication.DoesNotExist:
        application = AuditApplication()
        application.status = AuditApplication.NOT_APPLIED
        application.profileinfo_id = profileinfo_id
        application.audit_id = audit.id

    if not can_auditor_apply(profileinfo.user.id):
        raise AppLogicError("Please complete all ✳ marked fields under Profile, Bank Info sections")

    if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
        raise AppLogicError("preferred audit date is not within range")

    if audit.audit_cycle.status not in (AuditCycle.PREPARATION, AuditCycle.ARCHIVED) and application.status == AuditApplication.NOT_APPLIED or application.status is None:
        application.status = AuditApplication.APPLIED
        application.audit_date = audit_date
        application.save()
        #TODO:VERB should be encapsulated
        notify.send(
                profileinfo.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=notification.AUDIT_APPLICATION_APPLIED,
                action_object=application,
                target=audit
        )
        manager_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
        notify.send(
            profileinfo.user,
            recipient=profileinfo.user,
            verb=notification.AUDIT_APPLICATION_APPLIED,
            action_object=application,
            target=audit
        )
        auditor_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
        return application
    else:
        raise AppLogicError("you cannot apply to this audit")


@atomic
def cancel( audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditApplication.DoesNotExist, ProfileInfo.DoesNotExist ) as e:
        raise ObjectNotFound from e

    if audit.audit_cycle.status not in (AuditCycle.PREPARATION, AuditCycle.REPORT, AuditCycle.ARCHIVED) and application.status == AuditApplication.APPLIED:
        application.status = AuditApplication.NOT_APPLIED
        application.save()
        #TODO:VERB should be encapsulated
        notify.send(
                profileinfo.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_APPLICATION_CANCELED',
                action_object=application,
                target=audit
        )
        manager_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
        notify.send(
            profileinfo.user,
            recipient=profileinfo.user,
            verb='AUDIT_APPLICATION_CANCELED',
            action_object=application,
            target=audit
        )
        auditor_notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
        return application
    else:
        raise AppLogicError("you cannot cancel this application now")


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
    if audit_cycle.status in (AuditCycle.PREPARATION, AuditCycle.ARCHIVED):
        raise AppLogicError("application cannot be approved right now")

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

def can_auditor_apply(user_id):
    try:
        profileInfo = ProfileInfo.objects.get(user_id=user_id)
        bankInfo = BankInfo.objects.get(user_id=user_id)
        additionalInfo = AdditionalInfo.objects.get(user_id=user_id)
    except (ProfileInfo.DoesNotExist, BankInfo.DoesNotExist):
        return False
    except AdditionalInfo.DoesNotExist:
        pass

    if profileInfo.is_complete() and bankInfo.is_complete():
        return True
    else:
        return False


@atomic
def reject_all_applications_for_audit(audit_id, user_actor):
    audit = audit_service.find_audit_by_id(audit_id)
    return [reject(a.id, user_actor) for a in audit.applications.filter(status=AuditApplication.APPLIED)]


@atomic
def reject_all_applications_for_audit_cycle(audit_cycle_id, user_actor):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    applications = []
    for audit in audit_cycle.audits.all():
        applications.extend(reject_all_applications_for_audit(audit.id, user_actor))
    return applications


def get_application_stats(audit_cycle_id):
    return AuditApplication.objects.filter(audit__audit_cycle__id=audit_cycle_id).values('status').annotate(count=Count('status'))
