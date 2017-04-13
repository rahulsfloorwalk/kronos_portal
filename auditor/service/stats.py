from django.contrib.auth.models import User, Group
from registration.models import GROUP_NAME_AUDITOR

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore

def getAuditorHistoryStats(user_id):

    try:
        auditor = User.objects.get(pk=user_id)
        if auditor and auditor.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            audit_stores = AuditStore.objects.filter(user=auditor)
            result = {}
            for audit_store in audit_stores:
                if result.get(audit_store.status):
                    result[audit_store.status] += 1
                else:
                    result[audit_store.status] = 1
            return result
        else:
            raise ObjectNotFound
    except User.DoesNotExist:
        raise ObjectNotFound
