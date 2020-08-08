from kronos.exceptions import AppLogicError, ObjectNotFound
from django.conf import settings
from payment.models import Payment
from registration.service import auditor as auditor_service
from auditor.service.profile_info_service import find_profile_info_by_user_id
from notify.service.mail_concern_payment import send_payment_concern_email


def find_by_user(user_id):
    return Payment.objects.filter(user_id=user_id)


def find_payment_by_id(payment_id):
    try:
        return Payment.objects.get(pk=payment_id)
    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e


def payment_concern(payment_id, user_id, message):
    user = auditor_service.find_auditor_by_id(user_id)
    user_profile_info = find_profile_info_by_user_id(user_id)
    payment = find_payment_by_id(payment_id)

    if user != payment.user:
        raise AppLogicError("Concern not accepted by user")

    account_email = settings.FRONTEND_CONFIG['COMMON']['ACCOUNTS_EMAIL']
    send_payment_concern_email.delay(account_email, payment.audit_store.id, user_profile_info, message)
    return payment
