from audit_store import service as audit_store_service
from payment.models import Payment


def add_payment_on_audit_store_accepted(audit_store_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    payment = Payment()
    payment.audit_store = audit_store
    payment.user = audit_store.user
    payment.amount = (audit_store.audit.earnings_per_audit or 0) + (audit_store.audit.reimbursement or 0)
    payment.comment = "pending payment for auditor - {first} {last} for audit cycle - {audit_cycle} for client - {client}".format(
        first = audit_store.user.profileinfo.first_name,
        last = audit_store.user.profileinfo.last_name,
        audit_cycle=audit_store.audit.audit_cycle.name,
        client=audit_store.audit.audit_cycle.client.name
    )
    payment.save()

def clear_payment_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PAID
    payment.save()

def pay_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PAID
    payment.comment = "payment done for {first} {last} in bank - {bank} ({ifsc}) for account number - {account}".format(
        first = payment.audit_store.user.profileinfo.first_name,
        last = payment.audit_store.user.profileinfo.last_name,
        bank = payment.audit_store.user.bankinfo.bank_name,
        ifsc = payment.audit_store.user.bankinfo.ifsc_code,
        account = payment.audit_store.user.bankinfo.account_number
    )
    payment.save()

def unpay_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PENDING
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
