from django.contrib.auth.models import User
from kronos.exceptions import ObjectNotFound, AppLogicError

from auditor.models import ProfileInfo
from audit_store.models import AuditStore
import audit_store.service as audit_store_service

from answer.service import report_section_auditor as report_section_auditor_service

from .models import Attachment
from . import service as attachment_service


def upload_for_audit_store_by_auditor(audit_store_id, user_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)


def upload_for_report_section_by_auditor(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type)


def find_by_audit_store_for_auditor(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id):
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, section_id)

def find_by_profile_info_for_auditor(profile_info_id):
    profile_info = ProfileInfo.objects.get(pk=profile_info_id)
    return attachment_service.find_by_profile_info(profile_info.id)


def complete_for_auditor(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if audit_store.user.id != user_id:
        raise ObjectNotFound

    if audit_store.status != AuditStore.ASSIGNED:
        raise AppLogicError("cannot complete attachment now")

    return attachment_service.complete(attachment_id)


def delete_for_auditor(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if audit_store.user.id != user_id:
        raise ObjectNotFound

    if audit_store.status != AuditStore.ASSIGNED:
        raise AppLogicError("cannot delete attachment now")

    return attachment_service.delete(attachment_id)

def upload_for_id_proof_by_auditor(profile_info_id, file_name, file_size, mime_type):
    return attachment_service.upload_for_id_proof(profile_info_id, file_name, file_size, mime_type)
