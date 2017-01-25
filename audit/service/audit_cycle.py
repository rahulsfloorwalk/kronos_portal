from ..models import AuditCycle

def save(audit):
    AuditCycle.save(audit)
    return audit
