from kronos.exceptions import ObjectNotFound

from ..models import ReportSection

from questionnaire.service import section as section_service
from audit_store import service_moderator as audit_store_moderator_service
from . import report_section as report_section_service

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return report_section_service.find_by_audit_store(audit_store.id)

def find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id):
    try:
        audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
        section = section_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id, section_id)
        return ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
    except ReportSection.DoesNotExist as e:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
        report_section.save()
        return report_section


def submit_auditor_comment_for_moderator(audit_store_id, section_id, auditor_comment, user_id):
    report_section = find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return report_section_service.set_auditor_comment_by_manager(audit_store_id, section_id, auditor_comment)


def submit_pm_comment_for_moderator(audit_store_id, section_id, pm_comment, user_id):
    report_section = find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return report_section_service.submit_pm_comment(audit_store_id, section_id, pm_comment)
