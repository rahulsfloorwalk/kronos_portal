from django.db.transaction import atomic

from kronos.exceptions import ObjectNotFound, AppLogicError
from manager.service.manager import find_by_id,moderator_find_by_id
from ..models import ClientManager , ClientModerator
from manager.models import ManagerProfileInfo


def find_client_manager_by_id(client_manager_id):
    try:
        return ClientManager.objects.get(id=client_manager_id)
    except ClientManager.DoesNotExist as e:
        raise ObjectNotFound from e

def find_client_moderator_by_id(client_moderator_id):
    try:
        return ClientModerator.objects.get(id=client_moderator_id)
    except ClientModerator.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def insert_moderators(client, moderator_id, receive_email_notification, is_active):
    for moderator_id in moderator_id:
        obj, created = ClientModerator.objects.get_or_create(
            client=client,
            user_id=moderator_id,
            defaults={
                "receive_email_notification": receive_email_notification,
                "is_active": is_active
            }
        )
        if not created:
            obj.receive_email_notification = receive_email_notification
            obj.is_active = is_active
            obj.save()
    return ClientModerator.objects.filter(client=client)

def update_moderator(client_moderator_id, receive_email_notification, is_active):
    client_moderator = find_client_moderator_by_id(client_moderator_id)
    client_moderator.receive_email_notification = receive_email_notification
    client_moderator.is_active = is_active
    client_moderator.save()
    return client_moderator

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

def get_manager_contacts_list_by_audit_store_obj(audit_store):
    manager_contacts_list = []
    client_managers = ClientManager.objects.filter(client__id=audit_store.audit.audit_cycle.client.id,
                                                   is_active=True,receive_email_notification=True)
    for cm in client_managers:
        try:
            # ManagerProfileInfo has a 'user' field associated with the user
            manager_profile = ManagerProfileInfo.objects.get(user=cm.user)
            manager_contacts_list.append(manager_profile.mobile)
        except ManagerProfileInfo.DoesNotExist:
            pass

    return manager_contacts_list

def get_manager_names_list_by_audit_store_obj(audit_store):
    manager_name_list = []
    client_managers = ClientManager.objects.filter(client__id=audit_store.audit.audit_cycle.client.id,
                                                   is_active=True,receive_email_notification=True)
    for cm in client_managers:
        try:
            # ManagerProfileInfo has a 'user' field associated with the user
            manager_profile = ManagerProfileInfo.objects.get(user=cm.user)
            manager_name_list.append(manager_profile.name)
        except ManagerProfileInfo.DoesNotExist:
            pass

    return manager_name_list

def get_manager_info_list_by_audit_store_obj(audit_store):
    manager_info_list = []
    client_managers = ClientManager.objects.filter(client__id=audit_store.audit.audit_cycle.client.id,
                                                   is_active=True,receive_email_notification=True)

    for cm in client_managers:
        try:
            manager_profile = ManagerProfileInfo.objects.get(user=cm.user)
            name = getattr(manager_profile, 'name', '')
            mobile = getattr(manager_profile, 'mobile', '')
            manager_info_list.append({'name': name, 'mobile': mobile})
        except ManagerProfileInfo.DoesNotExist:
            pass

    return manager_info_list


