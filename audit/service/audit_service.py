from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.db.models import Q

from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle, Audit
from manager.models import City
from manager.service import geo
from registration.service import auditor as auditor_service

from audit.service import audit_cycle as audit_cycle_service

def find_audit_by_id(audit_id):
    try:
        return Audit.objects.get(pk=audit_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

def find_audits_by_audit_cycle_id(audit_cycle_id):
    return Audit.objects.filter(audit_cycle_id=audit_cycle_id).prefetch_related(
        'store',
        'store__client',
        'store__city',
        'audit_stores',
        'audit_stores__user',
        'audit_stores__user__profileinfo',
        'applications',
        'applications__profileinfo',
        'applications__profileinfo__user',
    )

def save(audit):
    try:
        audit.save()
        return audit
    except IntegrityError as e:
        raise AppLogicError("store is already added to this audit cycle") from e

def delete(audit_id):
    try:
        audit = find_audit_by_id(audit_id)
        audit.delete()
    except IntegrityError as e:
        raise AppLogicError("audit cannot be delete now") from e


def find_audits_around_city(city_id:int, kms:int=None):

    if kms not in [1,5,10,20,50,100]:
        kms=50  # default distance to search for

    try:
        city = City.objects.get(pk=city_id)
    except City.DoesNotExist as e:
        raise ObjectNotFound from e

    active_audits = Audit.objects.filter(
        count__gt = 0,
        audit_cycle__status__in=[
            AuditCycle.UPCOMING,
            AuditCycle.ACTIVE
        ]
    )

    # get the bounding box
    lon_max, lon_min, lat_max, lat_min = geo.bounding_box(city.lat, city.lon, kms)

    available_audits = active_audits.filter(
        # Q(audit_cycle__type__in=[AuditCycle.WEB, AuditCycle.PHONE]) |
        Q(audit_cycle__type=AuditCycle.GENERAL) |
        Q(
            store__city__lat__lte=lat_max,
            store__city__lat__gte=lat_min,
            store__city__lon__lte=lon_max,
            store__city__lon__gte=lon_min
        )
    )
    return available_audits


def find_audits_for_auditor(user_id, kms):
    auditor = auditor_service.find_auditor_by_id(user_id)

    if not auditor.profileinfo.is_complete():
        raise AppLogicError("please complete your personal information to view audits")

    if kms is None and hasattr(auditor, 'additionalinfo') and auditor.additionalinfo.distance:
        kms = auditor.additionalinfo.distance
    else:
        kms = 50

    return find_audits_around_city(auditor.profileinfo.city_id, int(kms))


@atomic
def copy_audits_from_to(from_audit_cycle_id, to_audit_cycle_id):
    try:
        from_audit_cycle = audit_cycle_service.find_by_id(from_audit_cycle_id)
        to_audit_cycle = audit_cycle_service.find_by_id(to_audit_cycle_id)

        for audit in from_audit_cycle.audits.all():
            new_audit = Audit()
            new_audit.audit_cycle = to_audit_cycle
            new_audit.store = audit.store
            new_audit.count = audit.count
            new_audit.earnings_per_audit = audit.earnings_per_audit
            new_audit.reimbursement = audit.reimbursement
            new_audit.post_approval_description = audit.post_approval_description
            new_audit.save()

        return to_audit_cycle.audits.all()
    except IntegrityError as e:
        raise AppLogicError("a store with audit already exists in this audit cycle")
