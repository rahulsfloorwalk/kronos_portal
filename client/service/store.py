from django.db import IntegrityError
from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound, AppLogicError

from ..models import Store

def save(store):
    store.save()
    return store


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
