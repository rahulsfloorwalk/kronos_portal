from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound

from ..models import Store

def save(store):
    store.save()
    return store

def find_cities_for_clientuser(user_id):
    try:
        user = User.objects.get(pk=user_id)
        return Store.objects.filter(client_id=user.clientuser.client_id).distinct('location__city_id').values('location__city__name','location__city__id', 'location__city__state').all()
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
