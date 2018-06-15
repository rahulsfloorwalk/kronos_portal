from audit_store import service as audit_store_service
from registration.service import manager as manager_service


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


def fail_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.fail(by=user)
    return audit_store


def withdraw_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.withdraw(by=user)
    return audit_store
