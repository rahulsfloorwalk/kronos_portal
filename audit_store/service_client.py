from .models import AuditStore


def find_upcoming_for_client(client_id):
    return AuditStore.objects.filter(audit__audit_cycle__client_id=client_id, status=AuditStore.ASSIGNED).order_by('audit_date')


def find_by_id_for_client(audit_store_id, client_id):
    try:
        return AuditStore.objects.get(
                audit__audit_cycle__client_id=client_id,
                id=audit_store_id,
                status=AuditStore.COMPLETED,
            )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

