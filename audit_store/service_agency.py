from audit.models import AuditCycle
from audit_store.models import AuditStore
from kronos.exceptions import ObjectNotFound


def find_audit_stores_for_agency_user(agency_user_id):
    return AuditStore.objects.filter(
        user_id=agency_user_id,
        status__in=AuditStore.AGENCY_VISIBILITY_STATUSES,
        audit__audit_cycle__status__in=(AuditCycle.UPCOMING, AuditCycle.ACTIVE, AuditCycle.REPORT)
    ).order_by('-audit_date')


def find_by_user_id_for_agency_user(audit_store_id, user_id):
    try:
        return AuditStore.objects.get(
            pk=audit_store_id,
            user_id=user_id,
            status__in=AuditStore.AGENCY_VISIBILITY_STATUSES,
            audit__audit_cycle__status__in=(AuditCycle.UPCOMING, AuditCycle.ACTIVE, AuditCycle.REPORT)
        )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
