from kronos.exceptions import ObjectNotFound

from audit_store.models import AuditStore
import audit_store.service as audit_store_service

from .models import Attachment
from . import service as attachment_service


def upload_for_audit_store_for_manager(audit_store_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_audit_store(audit_store_id, file_name, file_size, mime_type)


def find_by_audit_store_for_manager(audit_store_id):
    return attachment_service.find_by_audit_store(audit_store_id)


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
