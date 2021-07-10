from kronos.celery import app
from auditor.service import application_service
from auditor.models import AuditApplication


@app.task(ignore_result=True)
def reject_audit_application():
    applied_audit_applications = application_service.find_15_days_applied_audit_applications()
    waitlist_audit_applications = application_service.find_20_days_waitlist_audit_applications()
    for audit_application in applied_audit_applications:
        audit_application.status = AuditApplication.REJECTED
        audit_application.save()
    for audit_application in waitlist_audit_applications:
        audit_application.status = AuditApplication.REJECTED
        audit_application.save()
    return len(applied_audit_applications)
