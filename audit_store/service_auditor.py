from django.db.transaction import atomic
from kronos.exceptions import AppLogicError
from audit_store import service as audit_store_service
from registration.service import auditor as auditor_service
from django.utils import timezone
from audit_store.models import AuditStore, ReportStatusLog
from django.conf import settings
from notify.service.mail_fail_audit_report import send_audit_report_failed_email

@atomic
def acknowledge_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be acknowledged by user")

    audit_store.acknowledge(by=user)
    return audit_store


@atomic
def set_report_summary(audit_store_id, user_id, report_summary):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    if audit_store.is_editable_by_auditor():
        audit_store.set_report_summary(report_summary)
        audit_store.copy_report_summary()
        return audit_store
    else:
        raise AppLogicError("Cannot set report summary of current audit store")



@atomic
def submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be submitted by user")
    if not audit_store.is_submittable():
        raise AppLogicError("Please complete all answers and all section summaries before submitting")
    if not audit_store.check_auditor_comment_len():
        raise AppLogicError("Section summary should be greater than 30 characters")

    audit_store.submit(by=user)
    return audit_store

@atomic
def fail_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be failed by user")

    audit_store.status = AuditStore.FAILED
    audit_store.qa_rating = AuditStore.BAD
    audit_store.save()

    # Save Data in Report Status Log
    report_status_log = ReportStatusLog()
    report_status_log.user_actor = user
    report_status_log.status = AuditStore.FAILED
    report_status_log.message = ""
    report_status_log.audit_store = audit_store
    report_status_log.created_at = timezone.now()
    report_status_log.save()
    # End of Save Data in Report Status Log

    # Send Mail at "audits@floorwalk.in"
    if settings.EMAIL_SWITCH['AUDIT_REPORT_FAILED_BY_AUDITOR_EMAIL']:
        email = "audits@floorwalk.in"
        send_audit_report_failed_email.delay(email, audit_store)
    # End of Send Mail at "audits@floorwalk.in"
    return audit_store
