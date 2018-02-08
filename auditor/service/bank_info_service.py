from registration.service import auditor as auditor_service

from ..models import BankInfo

def find_bank_info_by_user_id(user_id):
    try:
        user = auditor_service.find_auditor_by_id(user_id)
        return BankInfo.objects.get(user_id=user.id)
    except BankInfo.DoesNotExist as e:
        return BankInfo(user_id=user.id)


def save(bank_info):
    bank_info.save()
    return bank_info
