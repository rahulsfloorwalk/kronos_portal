from auditor.models import AuditApplication


def fix_store_exists_for_applications():
    applications = AuditApplication.objects.order_by('audit_date').select_related('profileinfo', 'audit__store')
    for application in applications:
        profile = application.profileinfo
        store = application.audit.store
        if profile.user.auditstore_set.filter(audit__store=store, audit_date__lt=application.audit_date).exists():
            application.report_exists = True
            application.save()
