from audit.service import audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service

def moderator_summary_for_audit_cycle(audit_cycle_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    reports = audit_store_service.find_by_audit_cycle(audit_cycle.id)

    data = {}

    for r in reports:
        for moderator in r.assigned_to_moderator():
            if moderator.id not in data:
                data[moderator.id] = {}
            data[moderator.id][r.status] = data[moderator.id].get(r.status, 0) + 1
    return data
