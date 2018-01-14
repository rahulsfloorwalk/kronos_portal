
import answer.service.report_section as report_section_service
import audit_store.service_client as audit_store_client_service

import attachment.service as attachment_service


def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_client(audit_store_id, section_id, client_id):
    report_section = report_section_service.find_by_audit_store_and_section_for_client(audit_store_id, section_id, client_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)
