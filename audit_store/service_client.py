
from kronos.exceptions import AppLogicError, ObjectNotFound
from .models import AuditStore
from datetime import date


def find_upcoming_for_client(client_id):
    return AuditStore.objects.filter(
            audit__audit_cycle__client_id=client_id,
            status=AuditStore.ASSIGNED,
            audit_date__gte=date.today(),
        ).order_by('audit_date')


def find_by_id_for_client(audit_store_id, client_id):
    try:
        return AuditStore.objects.get(
                audit__audit_cycle__client_id=client_id,
                id=audit_store_id,
                status=AuditStore.COMPLETED,
            )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

