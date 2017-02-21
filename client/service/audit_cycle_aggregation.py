from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_CLIENT

from audit_store.models import AuditStore
from manager.service import audit as audit_service
from ..models import ClientUser

def get_audit_cycle_comparison(client_id, audit_cycle_type):
    data = {}
    store_names = []
    section_names = []
    rows = []

    audit_cycle = audit_service.get_latest_audit_cycle_for_client(client_id, audit_cycle_type)
    audits = audit_cycle.audits.all()
    sections = audit_cycle.sections.all()
    for audit in audits:
        store = audit.store
        audit_stores = audit.audit_stores.all()
        for audit_store in audit_stores:
            row = []
            if audit_store.status == AuditStore.COMPLETED:
                row.append(store.location.name)
                report_sections = audit_store.report_sections.all()
                for report_section in report_sections:
                    row.append(report_section.marks_obtained())
                rows.append(row)
    for section in sections:
        section_names.append(section.name)
    data['headings'] = section_names
    data['type'] = audit_cycle_type
    data['rows'] = rows
    return data
