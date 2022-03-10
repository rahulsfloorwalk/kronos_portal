import logging
from django.db.transaction import atomic
from auditor.models import AuditApplication

from kronos.celery import app
from auditor.service import application_service

from celery.result import ResultSet

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def auto_approve_audit_application():
    applied_audit_applications = application_service.find_audit_applications_for_auto_approve()

    async_results = ResultSet([])
    for application in applied_audit_applications:
        async_results.add(auto_approve_audit_application_task.delay(application.id))

    _logger.info("%s applications auto approved", len(async_results))
    return True


@app.task(ignore_result=True)
def auto_approve_audit_application_task(application_id):
    with atomic():
        application = application_service.find_application_by_id(application_id)
        if application.status == AuditApplication.APPLIED and application.audit.valid_report_count() < application.audit.count:
            audit_count = 1
            auto_approve = True
            application = application_service.approve(application.id, application.audit_date, application.audit.reimbursement, application.audit.earnings_per_audit, audit_count, application.profileinfo.user, auto_approve)
            application.is_auto_approved = True
            application.save()
            return True
    return False