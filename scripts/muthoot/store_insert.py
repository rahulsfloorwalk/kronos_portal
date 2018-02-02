import logging
import csv
from django.db import transaction
from client.models import Store, Client
from manager.models import City
from audit.models import AuditCycle, Audit

_logger = logging.getLogger(__name__)

@transaction.atomic
def insert_stores(client_id, filename):
    """
    Following columns _must_ exist in the CSV ( may be empty strings):
        - NAME
        - CODE
        - TYPE
        - ADDRESS
        - PHONE
        - CITY

    extra columns to be dumped into the 'store_data' JSONField should be specified in the extra_columns tuple
    the keys will be the column names, so think before you edit the tuple

    ALL COLUMNS MUST EXIST if they're specified
    """

    extra_columns = ('REGION', 'CLASSIFICATION', 'DISTRICT')

    stores = []

    client = Client.objects.get(pk=client_id)
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            store = Store()

            try:
                city = City.objects.get(name__iexact=row['CITY'])
            except City.DoesNotExist as e:
                _logger.error("ERR: city with name %s does not exist", row['CITY'])
                raise e

            store.name = row['NAME']
            store.client = client
            store.code = row['CODE'] or None
            # store.type = row['TYPE']
            store.address = row['ADDRESS']
            # store.phone = row['PHONE']
            store.city = city
            store.city = city
            store.extra_data = {col:row[col] for col in extra_columns}
            store.save()
            stores.append(store)

    return stores

def insert_all_audits(audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    stores = Store.objects.filter(client=audit_cycle.client)

    for store in stores:
        audit = Audit()
        audit.count = 1
        audit.reimbursement = audit_cycle.reimbursement
        audit.earnings_per_audit = audit_cycle.earnings_per_audit
        audit.store = store
        audit.audit_cycle = audit_cycle
        audit.save()

def insert_some_audits(stores, audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)

    for store in stores:
        audit = Audit()
        audit.count = 1
        audit.reimbursement = None
        audit.earnings_per_audit = audit_cycle.earnings_per_audit
        audit.store = store
        audit.audit_cycle = audit_cycle
        audit.save()


@transaction.atomic
def feb_02_2018_import(filename, client_id, audit_cycle_id):
    stores = insert_stores(client_id, filename)
    insert_some_audits(stores, audit_cycle_id)
