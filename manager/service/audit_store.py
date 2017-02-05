from audit_store.models import AuditStore
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound

def get_audit_stores(audit_cycle_id):
    try:
        audit_stores = []
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        for audit in audit_cycle.audits.all():
            audit_stores.extend(audit.audit_stores.all())
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    return audit_stores
