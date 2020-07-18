from django.db.transaction import atomic

from kronos.exceptions import ObjectNotFound, AppLogicError
from manager.service.manager import find_by_id
from ..models import ClientManager


def find_client_manager_by_id(client_manager_id):
    try:
        return ClientManager.objects.get(id=client_manager_id)
    except ClientManager.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def insert(client, manager_id, receive_email_notification, is_active):
    if ClientManager.objects.filter(client=client, user__id=manager_id).exists():
        raise AppLogicError("a manager is already exists in this client")
    else:
        manager = find_by_id(manager_id)

        client_manager = ClientManager()
        client_manager.client = client
        client_manager.user = manager
        client_manager.receive_email_notification = receive_email_notification
        client_manager.is_active = is_active
        client_manager.save()

        return client_manager


def update(client_manager_id, receive_email_notification, is_active):
    client_manager = find_client_manager_by_id(client_manager_id)
    client_manager.receive_email_notification = receive_email_notification
    client_manager.is_active = is_active
    client_manager.save()
    return client_manager


def get_manager_email_list_by_audit_store_obj(audit_store):
    manager_email_list = []
    client_managers = ClientManager.objects.filter(client__id=audit_store.audit.audit_cycle.client.id,
                                                   is_active=True, receive_email_notification=True)
    for cm in client_managers:
        manager_email_list.append(cm.user.email)
    return manager_email_list
