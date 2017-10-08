import csv
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_CLIENT

from client.models import Client, ClientUser, Store
from client.service import client_user as client_user_service
from manager.models import City, Location

from client.service import store as store_service

@transaction.atomic
def insert_accounts():
    manyavar = Client.objects.get(pk=7)
    filename = 'scripts/data/manyavar_accounts.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            client_user_service.insert(manyavar, row['name'][:50], row['email'], False, row['password'], True)


@transaction.atomic
def insert_permissions():
    filename = 'scripts/data/manyavar_accounts.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            store = Store.objects.get(code=row['code'])
            user = User.objects.get(email=row['email'])
            store_service.assign_store_to_client_user(store.id, user.id)
