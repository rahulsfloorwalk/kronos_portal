
from kronos.exceptions import AppLogicError

import audit_store.service_moderator as audit_store_service
import answer.service.report_section_moderator as report_section_moderator_service
import answer.service.answer_moderator as answer_moderator_service

from . import service as attachment_service


def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id):
    report_section = report_section_moderator_service.find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)


def upload_for_audit_store_for_moderator(audit_store_id, user_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)


def upload_for_report_section_for_moderator(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    report_section = report_section_moderator_service.find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)

    if not report_section.audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type)

def upload_for_answer_for_moderator(audit_store_id, question_id, file_name, file_size, mime_type, user_id):
    answer = answer_moderator_service.find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)

    if not answer.audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_answer(audit_store_id, answer.question_id, file_name, file_size, mime_type)

def rename_for_moderator(attachment_id, user_id, new_name):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot rename attachment now")

    return attachment_service.rename(attachment_id, new_name)

def complete_for_moderator(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot complete attachment now")

    return attachment_service.complete(attachment_id)

def delete_for_moderator(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot delete attachment now")

    return attachment_service.delete(attachment_id)
