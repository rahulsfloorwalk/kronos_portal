from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound, AppLogicError
from auditor.models import ProfileInfo, AuditApplication
from rest_framework.exceptions import ValidationError
from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from auditor.models import AuditApplication

def save(audit):
    try:
        audit.save()
        return audit
    except IntegrityError as e:
        raise AppLogicError("store is already added to this audit cycle") from e


def get_available_audits(profileinfo_id):
    profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
    if profileinfo.is_complete():
        return Audit.objects.filter(
            audit_cycle__status__in=[AuditCycle.UPCOMING, AuditCycle.ACTIVE],
            store__location__city_id=profileinfo.city.id
        )
        #return [audit for audit in audits if not audit.applications.filter(profileinfo_id=profileinfo_id).exists()]
    else:
        raise AppLogicError("please complete your personal information to view audits")

def get_applied_audits(profileinfo_id):
    profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
    if profileinfo.is_complete():
        audits = Audit.objects.filter(audit_cycle__status__in=[AuditCycle.UPCOMING, AuditCycle.ACTIVE])
        return [audit for audit in audits if not audit.applications.filter(profileinfo_id=profileinfo_id).exists()]
    else:
        raise AppLogicError("please complete your personal information to view audits")

def get_applications( profileinfo_id):
    return AuditApplication.objects.filter(profileinfo_id=profileinfo_id)

def get_application( audit_id, location_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        audit_location = audit.auditlocations.get(location_id=location_id)
        return audit_location.applications.get(profileinfo_id=profileinfo_id);
    except (Audit.DoesNotExist, AuditLocation.DoesNotExist, AuditApplication.DoesNotExist) as e:
        raise ObjectNotFound from e

def apply( audit_id, profileinfo_id, audit_date):
    try:
        audit = Audit.objects.get(id=audit_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, ) as e:
        raise ObjectNotFound from e
    except AuditApplication.DoesNotExist:
        application = AuditApplication()
        application.status = AuditApplication.NOT_APPLIED
        application.profileinfo_id = profileinfo_id
        application.audit_id = audit.id

    if audit.audit_cycle.status != AuditCycle.ARCHIVED and application.status == AuditApplication.NOT_APPLIED or application.status is None:
        application.status = AuditApplication.APPLIED
        application.audit_date = audit_date
        application.save()
        return application
    else:
        raise AppLogicError("you cannot apply to this audit")


def cancel( audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditApplication.DoesNotExist ) as e:
        raise ObjectNotFound from e

    if audit.audit_cycle.status != AuditCycle.ARCHIVED and application.status == AuditApplication.APPLIED:
        application.status = AuditApplication.NOT_APPLIED
        application.save()
        return application
    else:
        raise AppLogicError("you cannot cancel this application now")


@atomic
def fiat_assign(audit_id, email, audit_date):
    try:
        user = User.objects.get(email__iexact=email)
        audit = Audit.objects.get(pk=audit_id)
        audit_cycle = audit.audit_cycle
    except (Audit.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e
    except (User.DoesNotExist) as e:
        raise AppLogicError("email is not valid") from e

    if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
        raise AppLogicError("audit date is out of range")
    if audit_cycle.status == AuditCycle.ARCHIVED:
        raise AppLogicError("audit_cycle is archived")

    audit_store = AuditStore()
    audit_store.audit_id = audit.id
    audit_store.audit_date = audit_date
    audit_store.status = AuditStore.ASSIGNED
    audit_store.user_id = user.id

    audit_store.save()
    return audit_store

def get_latest_audit_cycle_for_client(client_id, audit_cycle_type):
    if audit_cycle_type is None:
        try:
            return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
    else:
        try:
            return AuditCycle.objects.filter(client_id=client_id, type=audit_cycle_type).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
