
from kronos.utils import today_ist
from kronos.exceptions import ObjectNotFound
from .models import AuditStore


def find_upcoming_for_client(client_id):
    return AuditStore.objects.filter(
        audit__audit_cycle__client_id=client_id,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
        audit_date__gte=today_ist(),
    ).order_by('audit_date')


def find_by_id_for_clientuser(audit_store_id, user):
    try:
        return AuditStore.objects.presentable().visible_to(user).get(
            audit__audit_cycle__client_id=user.clientuser.client.id,
            id=audit_store_id,
        )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def find_presentable_for_client(client_id):
    return AuditStore.objects.presentable().filter(
        audit__audit_cycle__client_id=client_id,
    ).order_by('-audit_date')
