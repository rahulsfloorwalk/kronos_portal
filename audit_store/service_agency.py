from django.db.transaction import atomic

from audit.models import AuditCycle
from audit_store.models import AuditStore
from kronos.exceptions import ObjectNotFound, AppLogicError


def find_audit_stores_for_agency_user(agency_user_id):
    return AuditStore.objects.filter(
        user_id=agency_user_id,
        status__in=AuditStore.AGENCY_VISIBILITY_STATUSES,
        audit__audit_cycle__status__in=AuditCycle.AGENCY_VISIBLE_STATUSES
    ).order_by('-audit_date')


def find_by_id_for_agency_user(audit_store_id, user_id):
    try:
        return AuditStore.objects.get(
            pk=audit_store_id,
            user_id=user_id,
            status__in=AuditStore.AGENCY_VISIBILITY_STATUSES,
            audit__audit_cycle__status__in=AuditCycle.AGENCY_VISIBLE_STATUSES
        )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def acknowledge_report(audit_store_id, user_id):
    audit_store = find_by_id_for_agency_user(audit_store_id, user_id)
    audit_store.acknowledge(by=audit_store.user)
    return audit_store


@atomic
def submit_report(audit_store_id, user_id):
    audit_store = find_by_id_for_agency_user(audit_store_id, user_id)
    audit_store.copy_report_summary()
    if not audit_store.is_submittable():
        raise AppLogicError("Report cannot be submitted now")
    audit_store.submit(by=audit_store.user)
    return audit_store
