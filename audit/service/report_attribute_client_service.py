
from audit.service.audit_cycle_client_service import find_audit_cycle_by_id_for_clientuser


def find_report_attributes_by_audit_cycle_id_for_client(audit_cycle_id, user_id):
    audit_cycle = find_audit_cycle_by_id_for_clientuser(audit_cycle_id, user_id)
    return audit_cycle.report_attributes
