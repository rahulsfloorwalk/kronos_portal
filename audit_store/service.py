from .models import AuditStore
from auditor.models import ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError

def get_audit_stores(profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.filter(user_id=profile_info.user_id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def get_audit_store(audit_store_id, profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.get(id=audit_store_id, user_id=profile_info.user_id)
    except (ProfileInfo.DoesNotExist, AuditStore.DoesNotExist) as e:
        raise ObjectNotFound from e
