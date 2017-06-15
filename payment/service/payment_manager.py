from audit_store.models import AuditStore
from payment.models import Payment


def add_payment_on_auit_store_accepted(audit_store_id):
    audit_store = AuditStore.objects.get(pk=audit_store_id)
    payment = Payment()
    payment.audit_store = audit_store
    payment.user = audit_store.user
    payment.amount = (audit_store.audit.earnings_per_audit or 0) + (audit_store.audit.reimbursement or 0)
    payment.comment = "pending payment for {audit_cycle}".format(audit_cycle=audit_store.audit.audit_cycle.name)
    payment.save()

def clear_payment_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PAID
    payment.save()

def clear_payment_for_audit_cycle(audit_cycle_id):
    payments = Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id).update(status=Payment.PAID)

def get_pending_payments():
    payments = Payment.objects.filter(status=Payment.PENDING)
    return payments

def find_by_audit_cycle(audit_cycle_id):
    return Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id)

def find_by_user(user_id):
    return Payment.objects.filter(user_id=user_id)
