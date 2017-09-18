import csv
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_CLIENT

from client.models import Client, ClientUser
from client.service import client_user as client_user_service
from manager.models import City, Location

@transaction.atomic
def insert_accounts():
    manyavar = Client.objects.get(pk=7)
    filename = 'scripts/data/manyavar_accounts.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            client_user_service.insert(manyavar, row['name'][:50], row['email'], False, row['password'], True)

