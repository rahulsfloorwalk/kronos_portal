from kronos.exceptions import AppLogicError, ObjectNotFound
from django.conf import settings
from django.db.models import Count, F, Case, When, Sum
from payment.models import Payment
from registration.service import auditor as auditor_service
from notify.service.mail_concern_payment import send_payment_concern_email


def find_by_user(user_id):
    return Payment.objects.filter(user_id=user_id).order_by('-audit_store__audit_date')


def find_payment_by_id(payment_id):
    try:
        return Payment.objects.get(pk=payment_id)
    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e


def payment_concern(payment_id, user_id, message):
    user = auditor_service.find_auditor_by_id(user_id)
    payment = find_payment_by_id(payment_id)

    if user != payment.user:
        raise AppLogicError("Concern not accepted by user")

    account_email = settings.FRONTEND_CONFIG['COMMON']['ACCOUNTS_EMAIL']
    send_payment_concern_email.delay(account_email, payment.audit_store.id, user_id, message)
    return payment

# def get_payment_list_by_user(user_id, is_load_more, last_total_count):
#     payments = find_by_user(user_id)
#     total_count = payments.count()
#     if is_load_more:
#         start = int(last_total_count)
#         end = int(last_total_count) + 20
#         payment_obj_slice = payments[start:end]
#     else:
#         payment_obj_slice = payments[0:20]
#     return payment_obj_slice, total_count

def get_payment_list_by_user(user_id,status, is_load_more, last_total_count):
    if not status:
        status = 'ALL'
    valid_statuses = ('PAID', 'PENDING', 'FAILED', 'ALL')
    status = status if status in valid_statuses else 'ALL'

    payments = Payment.objects.filter(user=user_id)
    if status != 'ALL':
        payments = payments.filter(status=status)

    total_count = payments.count()

    if is_load_more:
        start = int(last_total_count)
        end = start + 20
        payment_obj_slice = payments[start:end]
    else:
        payment_obj_slice = payments[:20]

    if not payment_obj_slice:
        return "No data available", total_count

    return payment_obj_slice,total_count

def get_payment_status_wise_list_by_user(user, status, is_load_more, last_total_count):
    valid_statuses = ('PAID', 'PENDING', 'FAILED', 'ALL')
    status = status if status in valid_statuses else 'ALL'

    payments = Payment.objects.filter(user=user)
    if status != 'ALL':
        payments = payments.filter(status=status)

    total_count = payments.count()

    if is_load_more:
        start = int(last_total_count)
        end = start + 1
        payment_obj_slice = payments[start:end]
    else:
        payment_obj_slice = payments[:1]

    if not payment_obj_slice:
        return "No data available", total_count

    return payment_obj_slice,total_count


def get_payment_summary_by_user(user_id):
    payments = find_by_user(user_id)
    summary = payments.aggregate(
        total_audits = Count('audit_store', distinct=True),
        total_transfered = Sum(Case(When(status=Payment.PAID,then=F('amount')), default=0)),
        total_pending = Sum(Case(When(status__in=[Payment.PENDING],then=F('amount')), default=0)),
        # total_reimbursement = Sum('audit_store__reimbursement'),
        total_reimbursement = Sum(Case(When(status=Payment.PAID,then=F('audit_store__reimbursement')), default=0)),
        total_paid_reimbursement=Sum(Case(When(status=Payment.PAID, then=F('audit_store__reimbursement')),default=0)),
        total_paid_earnings_per_audit=Sum(Case(When(status=Payment.PAID, then=F('audit_store__earnings_per_audit')),default=0)),
    )
    return summary