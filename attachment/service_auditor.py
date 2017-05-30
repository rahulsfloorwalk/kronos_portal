from kronos.exceptions import ObjectNotFound

from audit_store.models import AuditStore
import audit_store.service as audit_store_service

from .models import Attachment
from . import service as attachment_service


def upload_for_audit_store_by_auditor(audit_store_id, profileinfo_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.get_audit_store(audit_store_id, profileinfo_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)


def find_by_audit_store_for_auditor(audit_store_id, profileinfo_id):
    audit_store = audit_store_service.get_audit_store(audit_store_id, profileinfo_id)
    return attachment_service.find_by_audit_store(audit_store.id)


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
