

from auditor.models import AuditApplication


def find_unique_applications_by_cycle(cycle_id):
    applications = AuditApplication.objects.filter(audit__audit_cycle = cycle_id).exclude(status = AuditApplication.NOT_APPLIED).distinct('profileinfo__user').count()
    return applications