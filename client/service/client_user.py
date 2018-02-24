from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm, remove_perm
from guardian.shortcuts import get_users_with_perms

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_CLIENT

from ..models import ClientUser

from . import client_service
from . import store as store_service


def find_clientusers_by_client_id(client_id):
    return client_service.find_client_by_id(client_id).users


def find_clientuser_by_id(client_user_id):
    try:
        return ClientUser.objects.get(id=client_user_id)
    except ClientUser.DoesNotExist as e:
        raise ObjectNotFound from e


def find_clientuser_by_user_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_CLIENT).user_set.get(pk=user_id)
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e

@atomic
def insert(client, full_name, email, is_client_admin, password, is_active=True):
    try:
        if password == "":
            raise AppLogicError("password cannot be blank")

        user = User()
        user.email = email
        user.username = email
        user.set_password(password)
        user.is_active = is_active
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
        user.save()

        if is_client_admin:
            assign_perm('client.clientuser_admin', user)

        client_user = ClientUser()
        client_user.client = client
        client_user.full_name = full_name
        client_user.user = user
        client_user.save()

        return client_user
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


@atomic
def update(client_user_id, client, full_name, email, is_client_admin, password="", is_active=True):
    try:
        client_user = ClientUser.objects.get(pk=client_user_id)

        client_user.client = client
        client_user.full_name = full_name
        client_user.user.email = email
        client_user.user.username = email
        client_user.user.is_active = is_active

        if password != "":
            client_user.user.set_password(password)

        if is_client_admin:
            assign_perm('client.clientuser_admin', client_user.user)
        else:
            remove_perm('client.clientuser_admin', client_user.user)

        client_user.user.save()
        client_user.save()

        return client_user
    except ClientUser.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


def find_by_visible_store(store_id):
    store = store_service.find_store_by_id(store_id)
    users_with_perms = get_users_with_perms(store, attach_perms=True)
    return [user for user, perms in users_with_perms.items() if "clientuser_store_visible" in perms]

@atomic
def assign_store_to_client_user(store_id, user_id):
    store = store_service.find_store_by_id(store_id)
    user = find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == store.client.id:
        raise AppLogicError("cannot assign Store across client boundries")

    assign_perm('clientuser_store_visible', user, store)
    return find_by_visible_store(store_id)

@atomic
def revoke_store_from_client_user(store_id, user_id):
    store = store_service.find_store_by_id(store_id)
    user = find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == store.client.id:
        raise AppLogicError("cannot revoke Store across client boundries")

    remove_perm('clientuser_store_visible', user, store)
    return find_by_visible_store(store_id)
