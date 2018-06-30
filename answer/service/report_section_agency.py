from kronos.exceptions import AppLogicError, ObjectNotFound

from audit_store import service_agency as audit_store_service
from audit_store.models import AuditStore
from answer.service import report_section as report_section_service
from answer.models import ReportSection

from questionnaire.service import section as section_service


def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return ReportSection.objects.filter(audit_store_id=audit_store.id)


def find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)


def submit_auditor_comment_for_agency(audit_store_id, section_id, user_id, auditor_comment):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    if (audit_store.status != AuditStore.ACKNOWLEDGED):
        raise AppLogicError("Cannot submit auditor comment to current audit store")

    section = section_service.find_section_by_id(section_id)
    try:
        report_section = ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
    except ReportSection.DoesNotExist:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
    report_section.auditor_comment = auditor_comment
    report_section.auditor_comment_original = auditor_comment
    report_section.save()
    return report_section
