from django.db import IntegrityError
from django.contrib.auth.models import User,Group

from kronos.exceptions import ObjectNotFound, AppLogicError

from ..models import Store
from manager.models import City
from client.service import client_user as client_user_service
from client.service import client_service
from registration.models import GROUP_NAME_CLIENT

def find_user_by_id(user_id):
    return User.objects.get(pk=user_id)
    
def save(store):
    store.save()
    return store

def find_stores_by_client(client_id):
    return Store.objects.filter(client_id=client_id).order_by('city__name').select_related('client','city')


def find_stores_by_clientuser_for_manager(user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    # return Store.objects.filter(client_id=user.clientuser.client.id).order_by('city__name').select_related('client','city')
    return Store.objects.filter(client_id=user.clientuser.client.id).select_related('client', 'city')


def find_stores_by_clientuser(user_id, lastStoreId):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    if client_user.is_client_admin():
        if lastStoreId != "":
            store_obj = Store.objects.filter(client_id=user.clientuser.client.id, id__gt=lastStoreId).order_by('id') \
                .select_related('client', 'city')
        else:
            store_obj = Store.objects.filter(client_id=user.clientuser.client.id).order_by('id')\
                .select_related('client', 'city')
        city_list = list(store_obj.values_list('city__id', flat=True))
        cities_list = City.objects.filter(id__in=city_list)
        return store_obj[0:300], cities_list, store_obj.count()
    else:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        if lastStoreId != "":
            store_obj = Store.objects.filter(client_id=user.clientuser.client.id, id__gt=lastStoreId,
                                             id__in=non_admin_user_store_list).order_by('id')\
                .select_related('client', 'city')
        else:
            store_obj = Store.objects.filter(client_id=user.clientuser.client.id,
                                             id__in=non_admin_user_store_list).order_by('id') \
                .select_related('client', 'city')
        city_list = list(store_obj.values_list('city__id', flat=True))
        cities_list = City.objects.filter(id__in=city_list)
        return store_obj[0:300], cities_list, store_obj.count()


def find_stores_by_clientuser_and_city(user_id, city_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    return Store.objects.filter(client_id=user.clientuser.client.id, city_id=city_id).order_by('city__name').select_related('client','city')


def find_store_by_client_and_id(client_id, store_id):
    return Store.objects.get(id=store_id, client_id=client_id)

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
        return Store.objects.filter(client_id=user.clientuser.client_id).distinct('city_id').values('city__name','city__id', 'city__state').all()
    except User.DoesNotExist as e:
        raise ObjectNotFound from e


def find_filter_stores_by_clientuser(user_id, store_code, selected_city, percent_from, percent_to):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    if client_user.is_client_admin():
        stores = Store.objects.filter(client_id=user.clientuser.client.id)
    else:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        stores = Store.objects.filter(client_id=user.clientuser.client.id, id__in=non_admin_user_store_list)

    if store_code != "":
        stores = stores.filter(code__contains=store_code)
    if selected_city != "":
        stores = stores.filter(city_id=selected_city)
    if percent_from != "":
        store_list = []
        for store in stores:
            store_total_percentage = store.get_total_percentage()['score']
            if store_total_percentage:
                if (store_total_percentage >= int(percent_from)) and (store_total_percentage <= int(percent_to)):
                    store_list.append(store)
        stores = store_list
    return stores


def create_store_by_state(data):
    client = client_service.find_client_by_id(data['client'])
    client_city_list = Store.objects.filter(client = client.id, city__state = data['state']).values_list('city', flat=True)
    city_list = City.objects.filter(state=data['state']).exclude(id__in = client_city_list)
    if not city_list:
        raise AppLogicError("Stores are already created for this state")
    store_list = []
    for ind, city in enumerate(city_list):
        store = {
            'client': client,
            'city': city,
            'name': data.get('name', ''),
            'address': data.get('address', ''),
            'code': data.get('code', '') + str(city.id),
            'type': data.get('type', ''),
            'priority': ind + int(data['priority']) if data.get('priority', '') else '',
            'phone': data.get('phone', '')
        }
        store_list.append(Store(**store))
    stores = Store.objects.bulk_create(store_list)
    return stores