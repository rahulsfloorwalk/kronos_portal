from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError


def assign(application_id, audit_date):
    try:
        application = AuditApplication.objects.get(id=application_id)
        auditlocation = application.auditlocation
        audit = auditlocation.audit
    except (AuditApplication.DoesNotExist, AuditLocation.DoesNotExist, Audit.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if application.status != AuditApplication.APPLIED:
        raise AppLogicError("application cannot be assigned to right now")
    if audit.status == Audit.ARCHIVED:
        raise AppLogicErro("audit is archived")

    application.status = AuditApplication.ASSIGNED
    application.audit_date = audit_date
    application.save()
    return application


def reject(application_id):
    try:
        application = AuditApplication.objects.get(id=application_id)
        auditlocation = application.auditlocation
        audit = auditlocation.audit
    except (AuditApplication.DoesNotExist, AuditLocation.DoesNotExist, Audit.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if audit.status == Audit.ARCHIVED:
        raise AppLogicError("application for archived audit cannot be rejected")
    if application.status != AuditApplication.APPLIED:
        raise AppLogicError("application cannot be rejected now")

    application.status = AuditApplication.REJECTED
    application.save()
    return application

def complete(application_id):
    try:
        application = AuditApplication.objects.get(id=application_id)
        auditlocation = application.auditlocation
        audit = auditlocation.audit
    except (AuditApplication.DoesNotExist, AuditLocation.DoesNotExist, Audit.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if audit.status == Audit.ARCHIVED:
        raise AppLogicError("application for archived audit cannot be completed")
    if application.status != AuditApplication.ASSIGNED:
        raise AppLogicError("application cannot be completed now")

    application.status = AuditApplication.COMPLETED
    application.save()
    return application


def fail(application_id):
    try:
        application = AuditApplication.objects.get(id=application_id)
        auditlocation = application.auditlocation
        audit = auditlocation.audit
    except (AuditApplication.DoesNotExist, AuditLocation.DoesNotExist, Audit.DoesNotExist, ProfileInfo.DoesNotExist):
        raise ObjectNotFound

    if audit.status == Audit.ARCHIVED:
        raise AppLogicError("application for archived audit cannot be failed")
    if application.status != AuditApplication.ASSIGNED:
        raise AppLogicError("application cannot be failed now")

    application.status = AuditApplication.FAILED
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
