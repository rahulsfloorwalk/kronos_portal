from django.db.transaction import atomic
from kronos.exceptions import AppLogicError
from audit_store import service as audit_store_service
from registration.service import auditor as auditor_service


@atomic
def acknowledge_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be acknowledged by user")

    audit_store.acknowledge(by=user)
    return audit_store


@atomic
def set_report_summary_for_agency(audit_store_id, user_id, report_summary):
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
    audit_store.copy_report_summary()
    if not audit_store.is_submittable():
        raise AppLogicError("Please complete all answers and all section summaries before submitting")

    audit_store.submit(by=user)
    return audit_store

