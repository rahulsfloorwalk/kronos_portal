from django.db.transaction import atomic
from django.contrib.auth.models import Group
from notifications.signals import notify
from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR

@atomic
def approve(application_id, audit_date):
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
        application.profileinfo.user,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_APPLICATION_APPROVED',
        action_object=application,
        target=application.audit
    )
    notify.send(
            application.profileinfo.user,
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
        audit_store.user,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_STORE_ASSIGNED',
        action_object=audit_store,
        target=audit_store.audit
    )
    notify.send(
            audit_store.user,
            recipient=audit_store.user,
            verb='AUDIT_STORE_APPROVED',
            action_object=audit_store,
            target=audit_store.audit
    )
    return application

@atomic
def reject(application_id):
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
        application.profileinfo.user,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_APPLICATION_REJECTED',
        action_object=application,
        target=application.audit
    )
    notify.send(
            application.profileinfo.user,
            recipient=application.profileinfo.user,
            verb='AUDIT_APPLICATION_REJECTED',
            action_object=application,
            target=application.audit
    )
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
