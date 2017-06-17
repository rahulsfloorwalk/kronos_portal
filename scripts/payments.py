from payment.models import Payment
from audit.models import AuditCycle
from payment.service.payment_manager import add_payment_on_audit_store_accepted as insert_payment
from audit_store.models import AuditStore

def insert_payments_for_complete_reports():
    audit_stores = AuditStore.objects.all()
    for audit_store in audit_stores:
        if audit_store.status == AuditStore.COMPLETED:
            insert_payment(audit_store.id)

def accept_reports_add_payments():
    audit_cycle_status = [AuditCycle.REPORT, AuditCycle.ARCHIVED]
    audit_stores = AuditStore.objects.presentable().filter(audit__audit_cycle__status__in=audit_cycle_status)
    print (len(audit_stores))
    for a in audit_stores:
        a.status = AuditStore.ACCEPTED
        a.save()
        insert_payment(a.id)
