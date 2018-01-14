from registration.service import auditor as auditor_service

from ..models import AdditionalInfo

def find_additional_info_by_user_id(user_id):
    try:
        user = auditor_service.find_auditor_by_id(user_id)
        return AdditionalInfo.objects.get(user_id=user.id)
    except AdditionalInfo.DoesNotExist as e:
        return AdditionalInfo(user_id=user.id)
