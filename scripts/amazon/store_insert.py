import csv
from django.db import transaction
from client.models import Store, Client
from manager.models import Location, City
from audit.models import AuditCycle, Audit

@transaction.atomic
def insert_stores_and_audits(audit_cycle_id, filename):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)

    inserted_stores = insert_stores(audit_cycle.client_id, filename)
    inserted_audits = insert_audits_for_stores(audit_cycle_id, inserted_stores)

    return inserted_stores, inserted_audits


@transaction.atomic
def insert_stores(client_id, filename):

    extra_columns = ('REGION', 'STATE', 'PINCODE', 'STATUS', 'CRM', 'CDM', 'ADDRESS1', 'ADDRESS2', 'STATION', 'TYPE')

    amazon = Client.objects.get(pk=client_id)

    inserted_stores = []

    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            store = Store()
            city = City.objects.get(name__iexact=row['CITY'])
            locations = Location.objects.filter(name__iexact=row['CITY'], city=city)
            store.name = row['NAME']
            store.client = amazon
            store.code = row['CODE']
            store.type = row['TYPE']
            store.address = "{} ; {}".format(row['ADDRESS1'], row['ADDRESS2'])
            store.phone = row['PHONE']
            store.location = locations[0]
            store.city = city
            store.extra_data = {col:row[col] for col in extra_columns}
            store.save()
            inserted_stores.append(store)

    return inserted_stores

@transaction.atomic
def insert_all_audits(audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    stores = Store.objects.filter(client=audit_cycle.client)

    return insert_audits_for_stores(audit_cycle_id, stores)


@transaction.atomic
def insert_audits_for_stores(audit_cycle_id, stores):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)

    inserted_audits = []

    for store in stores:
        audit = Audit()
        audit.count = 1
        audit.reimbursement = 0
        audit.earnings_per_audit = 300
        audit.store = store
        audit.audit_cycle = audit_cycle
        audit.save()
        inserted_audits.append(audit)

    return inserted_audits
