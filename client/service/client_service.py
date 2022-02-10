from kronos.exceptions import ObjectNotFound

from ..models import Client
from audit.models.audit_cycle import AuditCycle

def find_client_by_id(client_id):
    try:
        return Client.objects.get(id=client_id)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e


def find_all_clients():
    return Client.objects.all()


def save(client):
    client.save()
    return client


def update_receive_email_notification(client_id, receive_email_notification):
    client = find_client_by_id(client_id)
    client.receive_email_notification = receive_email_notification
    client.save()
    return client

def find_client_by_dashboard_cycle_status():
    return Client.objects.filter(audits__status__in = AuditCycle.MANAGER_DASHBOARD_STATUSES).distinct('id').order_by('id')