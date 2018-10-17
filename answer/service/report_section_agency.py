from django.db.transaction import atomic

from kronos.exceptions import AppLogicError

from audit_store import service_agency as audit_store_service
from answer.service import report_section as report_section_service
from answer.models import ReportSection

def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return ReportSection.objects.filter(audit_store_id=audit_store.id)


def find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)

@atomic
def submit_auditor_comment_for_agency(audit_store_id, section_id, user_id, auditor_comment):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    if audit_store.is_editable_by_agency():
        report_section = find_by_audit_store_and_section_for_agency(audit_store.id, section_id, user_id)
        report_section.set_auditor_comment(auditor_comment)
        report_section.copy_auditor_comment_original()
        return report_section
    else:
        raise AppLogicError("Cannot submit auditor comment to current audit store")
