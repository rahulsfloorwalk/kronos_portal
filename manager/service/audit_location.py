from audit.models import Audit

def save(auditLocation):
    auditLocation.save()
    return auditLocation
