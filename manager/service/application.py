from django.db.transaction import atomic

from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError

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

    audit_store = AuditStore()
    audit_store.audit_id = audit.id
    audit_store.audit_date = application.audit_date
    audit_store.status = AuditStore.ASSIGNED
    audit_store.user_id = application.profileinfo.user_id

    audit_store.save()
    return application


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
