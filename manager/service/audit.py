from kronos.exceptions import ObjectNotFound, AppLogicError
from auditor.models import ProfileInfo, AuditApplication
from rest_framework.exceptions import ValidationError
from audit.models import AuditCycle, Audit
from django.contrib.auth.models import User

def save(audit):
    audit.save()
    return audit

def get_available_audits(profileinfo_id):
    profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
    if profileinfo.is_complete():
        return Audit.objects.filter(status__in=[Audit.UPCOMING, Audit.ACTIVE])
    else:
        raise AppLogicError("please complete your personal information to view audits")

def get_applications( audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        auditlocations = audit.auditlocations.all()
        applications = []
        for al in auditlocations:
            for a in al.applications.filter(profileinfo_id=profileinfo_id):
                applications.append(a)
        return applications
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

def get_application( audit_id, location_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        audit_location = audit.auditlocations.get(location_id=location_id)
        return audit_location.applications.get(profileinfo_id=profileinfo_id);
    except (Audit.DoesNotExist, AuditLocation.DoesNotExist, AuditApplication.DoesNotExist) as e:
        raise ObjectNotFound from e

def apply( audit_id, location_id, profileinfo_id, audit_date):
    try:
        audit = Audit.objects.get(id=audit_id)
        audit_location = audit.auditlocations.get(location_id=location_id)
        application = audit_location.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditLocation.DoesNotExist, ) as e:
        raise ObjectNotFound from e
    except AuditApplication.DoesNotExist:
        application = AuditApplication()
        application.status = AuditApplication.NOT_APPLIED
        application.profileinfo_id = profileinfo_id
        application.auditlocation_id = audit_location.id

    if application.status == AuditApplication.NOT_APPLIED or application.status is None:
        application.status = AuditApplication.APPLIED
        application.audit_date = audit_date
        application.save()
        return application
    else:
        raise AppLogicError("you cannot apply to this audit")

def cancel( audit_id, location_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        audit_location = audit.auditlocations.get(location_id=location_id)
        application = audit_location.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditLocation.DoesNotExist, AuditApplication.DoesNotExist ) as e:
        raise ObjectNotFound from e

    if application.status == AuditApplication.APPLIED:
        application.status = AuditApplication.NOT_APPLIED
        application.save()
        return application
    else:
        raise AppLogicError("you cannot cancel this application now")
