from django.db import IntegrityError
from django.db.transaction import atomic
from django.contrib.auth.models import User

from guardian.shortcuts import assign_perm, remove_perm

from kronos.exceptions import ObjectNotFound, AppLogicError

from ..models import Store
import client.service.client_user as client_user_service


def save(store):
    store.save()
    return store

def find_stores_by_clientuser(user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    return Store.objects.filter(client_id=user.clientuser.client.id).select_related('client','location','location__city')

def find_stores_by_clientuser_and_city(user_id, city_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    return Store.objects.filter(client_id=user.clientuser.client.id, location__city_id=city_id).select_related('client','location','location__city')


def find_store_by_id(store_id):
    try:
        return Store.objects.get(pk=store_id)
    except Store.DoesNotExist as e:
        raise ObjectNotFound from e


def delete(store_id):
    try:
        store = Store.objects.get(pk=store_id)
        store.delete()
    except Store.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("store is not deletable now") from e


def find_cities_for_clientuser(user_id):
    try:
        user = User.objects.get(pk=user_id)
        return Store.objects.filter(client_id=user.clientuser.client_id).distinct('location__city_id').values('location__city__name','location__city__id', 'location__city__state').all()
    except User.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def assign_store_to_client_user(store_id, user_id):
    store = find_store_by_id(store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == store.client.id:
        raise AppLogicError("cannot assign Store across client boundries")

    assign_perm('clientuser_store_visible', user, store)
    return store


@atomic
def revoke_store_from_client_user(store_id, user_id):
    store = find_store_by_id(store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == store.client.id:
        raise AppLogicError("cannot revoke Store across client boundries")

    remove_perm('clientuser_store_visible', user, store)
    return store
