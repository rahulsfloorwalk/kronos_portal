from kronos.exceptions import AppLogicError
from audit_store import service as audit_store_service
from registration.service import manager as manager_service
from answer.models import ReportSection

def set_report_attribute_value(audit_store_id, json_id, option_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        return audit_store_service.set_report_attribute_value(audit_store.id, json_id, option_id)
    else:
        raise AppLogicError("cannot set report attribute now")


def set_reimbursement(audit_store_id, reimbursement, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        audit_store.set_reimbursement(reimbursement)
        return audit_store
    else:
        raise AppLogicError("cannot set reimbursement now")

def set_earnings_per_audit(audit_store_id, earnings_per_audit, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        audit_store.set_earnings_per_audit(earnings_per_audit)
        return audit_store
    else:
        raise AppLogicError("cannot set earnings per audit now")


def set_report_summary(audit_store_id, report_summary, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)
    if audit_store.is_editable_by_manager():
        audit_store.set_report_summary(report_summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")


def submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.submit(by=user)
    return audit_store


def revert_submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.revert_submit(by=user)
    return audit_store


def qa_ok_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.qa_ok(by=user)
    return audit_store


def pm_revert_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.pm_revert(by=user)
    return audit_store


def complete_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.complete(by=user)
    report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
    for report in report_obj:
        report.save_percentage()
    return audit_store


def revert_complete_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.revert_complete(by=user)
    return audit_store


def accept_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.accept(by=user)
    return audit_store


def reject_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.reject(by=user)
    return audit_store


def fail_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.fail(by=user, message=message)
    return audit_store


def withdraw_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.withdraw(by=user)
    return audit_store
