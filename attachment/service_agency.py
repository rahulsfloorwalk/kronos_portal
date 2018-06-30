from kronos.exceptions import AppLogicError, ObjectNotFound
from audit_store import service_agency as audit_store_service
from answer.service import report_section_agency as report_section_agency_service
from attachment import service as attachment_service
from audit_store.models import AuditStore
from answer.models import ReportSection


def upload_for_audit_store_by_agency(audit_store_id, file_name, file_size, mime_type, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)


def upload_for_report_section_by_agency(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    report_section = report_section_agency_service.find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id)
    return attachment_service.upload_for_report_section(audit_store_id, report_section.section_id, file_name, file_size, mime_type)


def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_user_id_for_agency_user(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id):
    report_section = report_section_agency_service.find_by_audit_store_and_section_for_agency(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)


def complete_for_agency(attachment_id, user_id):

    attachment = attachment_service.find_by_id(attachment_id)

    if attachment.content_type.model_class() in (AuditStore, ReportSection):
        audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status != AuditStore.ACKNOWLEDGED:
            raise AppLogicError("Cannot complete attachment now")
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.complete(attachment_id)


def delete_for_agency(attachment_id, user_id):
    attachment = attachment_service.find_by_id(attachment_id)

    if attachment.content_type.model_class() in (AuditStore, ReportSection):
        audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status != AuditStore.ACKNOWLEDGED:
            raise AppLogicError("Cannot delete attachment now")

    else:
        raise AppLogicError("Error while deleting attachment")

    return attachment_service.delete(attachment_id)
