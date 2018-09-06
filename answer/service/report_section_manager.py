from kronos.exceptions import AppLogicError
from answer.service import report_section as report_section_service

def set_not_applicable_for_manager(audit_store_id, section_id, not_applicable):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)
    if report_section.audit_store.is_editable_by_manager():
        report_section.set_not_applicable(not_applicable)
        return report_section
    else:
        raise AppLogicError("Report Section not applicable cannot be set now")

def set_auditor_comment_for_manager(audit_store_id, section_id, auditor_comment):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)
    if report_section.audit_store.is_editable_by_manager():
        report_section.set_auditor_comment(auditor_comment)
        return report_section
    else:
        raise AppLogicError("Report Section auditor comment cannot be set now")

def set_pm_comment_for_manager(audit_store_id, section_id, pm_comment):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)
    if report_section.audit_store.is_editable_by_manager():
        report_section.set_pm_comment(pm_comment)
        return report_section
    else:
        raise AppLogicError("Report Section pm comment cannot be set now")
