from kronos.exceptions import ObjectNotFound, AppLogicError

from auditor.models import ProfileInfo
from audit_store.models import AuditStore
import audit_store.service as audit_store_service

from answer.models import ReportSection
from answer.service import report_section_auditor as report_section_auditor_service

from . import service as attachment_service


def upload_for_audit_store_by_auditor(audit_store_id, user_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)


def upload_for_report_section_by_auditor(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    print("UPLOADING FOR REPORT SECTION")
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.upload_for_report_section(audit_store_id, report_section.section_id, file_name, file_size, mime_type)


def find_by_audit_store_for_auditor(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id):
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)

def find_id_proof_for_auditor(user_id):
    try:
        profile_info = ProfileInfo.objects.get(user_id=user_id)
        return attachment_service.find_by_profile_info(profile_info.id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def complete_for_auditor(attachment_id, user_id):

    attachment = attachment_service.find_by_id(attachment_id)

    if attachment.content_type.model_class() in (AuditStore, ReportSection):
        audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status != AuditStore.ASSIGNED:
            raise AppLogicError("cannot complete attachment now")
    elif attachment.content_type.model_class() == ProfileInfo:
        profile_info = attachment_service.get_auditor_for_attachment(attachment_id)

        if profile_info.user.id != user_id:
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.complete(attachment_id)


def delete_for_auditor(attachment_id, user_id):
    attachment = attachment_service.find_by_id(attachment_id)

    if attachment.content_type.model_class() in (AuditStore, ReportSection):
        audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status != AuditStore.ASSIGNED:
            raise AppLogicError("cannot complete attachment now")

    elif attachment.content_type.model_class() == ProfileInfo:
        profile_info = attachment_service.get_auditor_for_attachment(attachment_id)

        if profile_info.user.id != user_id:
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.delete(attachment_id)

def upload_for_id_proof_by_auditor(profile_info_id, file_name, file_size, mime_type):
    return attachment_service.upload_for_id_proof(profile_info_id, file_name, file_size, mime_type)
