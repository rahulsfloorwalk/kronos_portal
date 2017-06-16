from payment.models import Payment
from payment.service.payment_manager import add_payment_on_audit_store_accepted as insert_payment
from audit_store.models import AuditStore

def insert_payments_for_complete_reports():
    audit_stores = AuditStore.objects.all()
    for audit_store in audit_stores:
        if audit_store.status == AuditStore.COMPLETED:
            insert_payment(audit_store.id)
