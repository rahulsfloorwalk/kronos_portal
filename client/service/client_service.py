from kronos.exceptions import ObjectNotFound

from ..models import BankInfo, Client, ClientUser
from audit.models.audit_cycle import AuditCycle

def find_client_by_id(client_id):
    try:
        return Client.objects.get(id=client_id)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e


def find_client_by_user_id(user_id):
    try:
        return ClientUser.objects.get(user_id=user_id).client
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e


def find_bank_info_by_id(client_id):
    try:
        return BankInfo.objects.get(client_id=client_id)
    except BankInfo.DoesNotExist as e:
        return BankInfo(client_id=client_id)


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

def find_client_by_active_cycle_status():
    return Client.objects.filter(audits__status = AuditCycle.ACTIVE).distinct('id').order_by('id')