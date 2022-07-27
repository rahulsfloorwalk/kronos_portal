
import audit_store.service as audit_store_service

import answer.service.report_section as report_section_service

def find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)


def remove_section_revert_message_for_auditor(audit_store_id, user_id):
    report_sections = report_section_service.find_by_audit_store_for_user(audit_store_id, user_id)
    report_sections.update(revert_message = "")