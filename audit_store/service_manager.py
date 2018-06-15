from audit_store import service as audit_store_service
from registration.service import manager as manager_service


def submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.submit(by=user)
    return audit_store

