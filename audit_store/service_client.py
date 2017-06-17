
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
        return AuditStore.objects.presentable().get(
                audit__audit_cycle__client_id=client_id,
                id=audit_store_id,
            )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def find_presentable_for_client(client_id):
    return AuditStore.objects.presentable().filter(
            audit__audit_cycle__client_id=client_id,
        ).order_by('-audit_date')
