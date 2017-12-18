from django.db import transaction

from client.models import Store


@transaction.atomic
def fill_city_for_all_stores():
    stores = Store.objects.all()

    for store in stores:
        store.city = store.location.city
        store.save()
