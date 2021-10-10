from django.db import transaction
from registration.service import auditor as auditor_service

from ..models import BankInfo
from payment.service import payment_beneficiary as payment_service

def find_bank_info_by_user_id(user_id):
    try:
        user = auditor_service.find_auditor_by_id(user_id)
        return BankInfo.objects.get(user_id=user.id)
    except BankInfo.DoesNotExist as e:
        return BankInfo(user_id=user.id)


def save(bank_info):
    with transaction.atomic():
        bank_info.save()
        bene_info = payment_service.get_beneficiary_id_for_user(bank_info.user.id)
        bene_info.beneficiary_checked = False
        bene_info.save()
    if bank_info.is_payable():
        # Create or Modify beneficiary on cashfree
        payment_service.validate_beneficiary(bank_info.user)
    return bank_info
