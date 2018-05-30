from kronos.exceptions import AppLogicError

from audit_store.models import AuditStore
import audit_store.service as audit_store_service

import answer.service.report_section as report_section_service

from . import service as attachment_service


def upload_for_audit_store_for_manager(audit_store_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_audit_store(audit_store_id, file_name, file_size, mime_type)


def upload_for_report_section_for_manager(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)

    if report_section.audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type)


def find_by_audit_store_for_manager(audit_store_id):
    return attachment_service.find_by_audit_store(audit_store_id)


def find_by_audit_store_and_section_for_manager(audit_store_id, section_id, user_id):
    return attachment_service.find_by_audit_store_and_section(audit_store_id, section_id)


def complete_for_manager(attachment_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("cannot complete attachment now")

    return attachment_service.complete(attachment_id)


def delete_for_manager(attachment_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("cannot delete attachment now")

    return attachment_service.delete(attachment_id)

def rename_for_manager(attachment_id, new_name):
    return attachment_service.rename(attachment_id, new_name)
