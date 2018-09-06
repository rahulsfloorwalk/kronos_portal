import csv
from django.db import transaction
from client.models import Store, Client
from manager.models import City, Location

@transaction.atomic
def find_or_update_locations():
    filename = 'scripts/data/manyavar_stores.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            locations = Location.objects.filter(name=row['city'])
            cities = City.objects.filter(name=row['city'])
            if(len(locations) > 0):
                pass
            elif(len(cities) > 0):
                location = Location()
                location.name = cities[0].name
                location.city = cities[0]
                location.pincode = 'no_pin'
                location.save()

@transaction.atomic
def insert_stores():
    stores = Store.objects.filter(client_id=7)
    if(len(stores) > 100):
        print("Stores already present")
        return

    filename = 'scripts/data/manyavar_stores.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            store = Store()
            locations = Location.objects.filter(name=row['city'])
            client = Client.objects.get(pk=row['client'])
            store.code = row['code']
            store.type = row['type']
            store.priority = row['priority']
            store.name = row['name']
            store.address = row['address']
            store.client = client
            store.location = locations[0]
            store.save()

def insert_store_data():
    find_or_update_locations()
    insert_stores()


