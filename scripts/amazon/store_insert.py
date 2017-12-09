import csv
from django.db import transaction
from client.models import Store, Client
from manager.models import Location
from audit.models import AuditCycle, Audit

@transaction.atomic
def insert_stores(client_id, filename):
    stores = Store.objects.filter(client_id=client_id)
    if(len(stores) > 0):
        print("Stores already present for client with id: ", client_id)
        return

    amazon = Client.objects.get(pk=client_id)
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            store = Store()
            locations = Location.objects.filter(name__iexact=row['city'], city__name__iexact=row['city'])
            store.name = row['name']
            store.client = amazon
            store.code = row['code']
            store.type = row['type']
            store.address = row['address']
            store.phone = row['phone']
            store.location = locations[0]
            store.save()

def insert_all_audits(audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    stores = Store.objects.filter(client=audit_cycle.client)

    for store in stores:
        audit = Audit()
        audit.count = 1
        audit.reimbursement = 0
        audit.earnings_per_audit = 300
        audit.store = store
        audit.audit_cycle = audit_cycle
        audit.save()
