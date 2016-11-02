from ..models import AuditLocation

def save(auditLocation):
    auditLocation.save()
    return auditLocation
