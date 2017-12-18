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
    section_max_marks = []
    rows = []

    audit_cycle = audit_service.get_latest_audit_cycle_for_client(client_id, audit_cycle_type)
    audits = audit_cycle.audits.all()
    sections = audit_cycle.sections.order_by("sequence").all()
    for audit in audits:
        store = audit.store
        audit_stores = audit.audit_stores.presentable().order_by("-audit_date")
        for audit_store in audit_stores:
            row = []
            row.append(audit_store.id)
            row.append(store.name)
            row.append(store.city.name)
            row.append(audit_store.audit_date)
            report_sections = audit_store.report_sections.order_by("section__sequence").all()
            for report_section in report_sections:
                if report_section.section.max_marks() != 0:
                    row.append(report_section.marks_obtained())
            row.append(audit_store.percentage())
            rows.append(row)

    section_names.append("Store")
    section_names.append("City")
    section_names.append("Audit Date")
    section_max_marks.append("")
    section_max_marks.append("")
    section_max_marks.append("Max Marks:")
    for section in sections:
        if section.max_marks() != 0:
            section_names.append(section.name)
            section_max_marks.append(section.max_marks())
    section_names.append("Percentage")
    section_max_marks.append("100%")

    data['headings'] = section_names
    data['section_max_marks'] = section_max_marks
    data['type'] = audit_cycle.type
    data['rows'] = rows
    return data
