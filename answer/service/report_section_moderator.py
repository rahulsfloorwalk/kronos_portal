from kronos.exceptions import AppLogicError
from audit_store import service_moderator as audit_store_moderator_service
from . import report_section as report_section_service

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return report_section_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)


def submit_auditor_comment_for_moderator(audit_store_id, section_id, auditor_comment, user_id):
    report_section = find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return report_section_service.set_auditor_comment_by_manager(audit_store_id, report_section.section_id, auditor_comment)


def submit_pm_comment_for_moderator(audit_store_id, section_id, pm_comment, user_id):
    report_section = find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return report_section_service.submit_pm_comment(audit_store_id, report_section.section_id, pm_comment)

def set_not_applicable_for_moderator(audit_store_id, section_id, not_applicable, user_id):
    report_section = find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    if report_section.audit_store.is_editable_by_moderator():
        report_section.set_not_applicable(not_applicable)
        return report_section
    else:
        raise AppLogicError("Report Section not applicable cannot be set now")
