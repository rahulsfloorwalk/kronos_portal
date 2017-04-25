
from kronos.exceptions import ObjectNotFound

import audit_store.service_moderator as audit_store_service

from .models import Attachment
from . import service as attachment_service


def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store_id)

def upload_for_audit_store_for_moderator(audit_store_id, user_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)

def rename_for_moderator(attachment_id, user_id, new_name):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)
    return attachment_service.rename(attachment_id, new_name)

def complete_for_moderator(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)
    return attachment_service.complete(attachment_id)

def delete_for_moderator(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)
    return attachment_service.delete(attachment_id)
