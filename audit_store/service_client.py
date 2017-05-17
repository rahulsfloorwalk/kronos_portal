from .models import AuditStore

def find_upcoming_for_client(client_id):
    return AuditStore.objects.filter(audit__audit_cycle__client_id=client_id, status=AuditStore.ASSIGNED).order_by('audit_date')
