
from audit_store import service_agency as audit_store_service
from answer.service import report_section as report_section_service
from answer.models import ReportSection


def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return ReportSection.objects.filter(audit_store_id=audit_store.id)


def find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)
