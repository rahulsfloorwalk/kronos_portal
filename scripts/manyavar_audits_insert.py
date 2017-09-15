import datetime
from django.db import IntegrityError, transaction
from audit.models import AuditCycle, Audit
from client.models import Client, Store


def get_or_create_if_only_pilot():
    manyavar_cycles = AuditCycle.objects.filter(client_id=7).reverse()
    if(len(manyavar_cycles) > 1):
        return manyavar_cycles[0]
    else:
        audit_cycle = AuditCycle()
        audit_cycle.client = Client.objects.get(pk=7)
        audit_cycle.name = 'Manyavar September 2017'
        audit_cycle.type = AuditCycle.WALKIN
        audit_cycle.status = AuditCycle.PREPARATION
        audit_cycle.start_date = datetime.date(2017, 9, 21)
        audit_cycle.end_date = datetime.date(2017, 10, 5)
        audit_cycle.save()
        return audit_cycle


@transaction.atomic
def insert_audits():
    audit_cycle = get_or_create_if_only_pilot()
    stores = Store.objects.filter(client_id=7)
    audits = Audit.objects.filter(audit_cycle=audit_cycle)
    if len(audits) > 0:
        print("Audits Already Inserted")
        return
    for store in stores:
        if store.id in [40, 41, 42, 43, 44]:
            pass
        else:
            audit = Audit()
            audit.count = 2
            audit.reimbursement = 0
            audit.earnings_per_audit = 400
            audit.store = store
            audit.audit_cycle = audit_cycle
            audit.save()


