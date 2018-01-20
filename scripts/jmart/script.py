import logging
import csv
from django.db import transaction
from client.models import Store, Client
from manager.models import City

_logger = logging.getLogger(__name__)

@transaction.atomic
def insert_stores(client_id, filename):
    """
    Following columns _must_ exist in the CSV ( may be empty strings):
        - NAME
        - ADDRESS
        - CITY

    extra columns to be dumped into the 'store_data' JSONField should be specified in the extra_columns tuple
    the keys will be the column names, so think before you edit the tuple

    ALL COLUMNS MUST EXIST if they're specified
    """

    extra_columns = ()

    client = Client.objects.get(pk=client_id)
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if Store.objects.filter(client_id=client_id, name=row['NAME']).count() > 0:
                print("skipping store with name ", row['NAME'], " already exists")
                continue

            store = Store()

            try:
                city = City.objects.get(name__iexact=row['CITY'])
            except City.DoesNotExist as e:
                _logger.error("ERR: city with name %s does not exist", row['CITY'])
                raise e

            store.name = row['NAME']
            store.client = client
            store.address = row['ADDRESS']
            store.city = city
            store.extra_data = {col:row[col] for col in extra_columns}
            store.save()

