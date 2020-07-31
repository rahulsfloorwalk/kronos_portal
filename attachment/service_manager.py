from kronos.exceptions import AppLogicError

import audit_store.service as audit_store_service

import answer.service.report_section as report_section_service
import answer.service.answer as answer_service

from . import service as attachment_service


def upload_for_audit_store_for_manager(audit_store_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_audit_store(audit_store_id, file_name, file_size, mime_type)


def upload_for_report_section_for_manager(audit_store_id, section_id, file_name, file_size, mime_type, user_id):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)

    if not report_section.audit_store.is_editable_by_manager():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type)

def upload_for_answer_for_manager(audit_store_id, question_id, file_name, file_size, mime_type, user_id):
    answer = answer_service.find_by_audit_store_and_question(audit_store_id, question_id)

    if not answer.audit_store.is_editable_by_manager():
        raise AppLogicError("cannot upload attachment now")

    return attachment_service.upload_for_answer(audit_store_id, answer.question_id, file_name, file_size, mime_type)


def find_by_audit_store_for_manager(audit_store_id):
    return attachment_service.find_by_audit_store(audit_store_id)


def find_by_audit_store_and_section_for_manager(audit_store_id, section_id, user_id):
    return attachment_service.find_by_audit_store_and_section(audit_store_id, section_id)


def complete_for_manager(attachment_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot complete attachment now")

    return attachment_service.complete(attachment_id)


def delete_for_manager(attachment_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot delete attachment now")

    attachment_service.delete(attachment_id)


def rename_for_manager(attachment_id, new_name):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot rename attachment now")

    return attachment_service.rename(attachment_id, new_name)


def move_to_section(audit_store_id,section_id,attachment_list):
    if not attachment_list and not section_id:
        raise AppLogicError("Please select attachment and section in which attachment to be moved")
    if not attachment_list:
        raise AppLogicError("Please select attachment to be moved")
    if not section_id:
        raise AppLogicError("Please select section to move attachment")
    audit_store = audit_store_service.find_by_id(audit_store_id)
    if section_id == "0":
        content_obj = audit_store
    else:
        report_section = report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)
        content_obj = report_section
    for attachment_id in attachment_list:
        attachment = attachment_service.update_attachment_section(attachment_id,content_obj)
    return attachment


def save_attachment_proof_tag(attachment_id, proof_tag_id):
    return attachment_service.save_attachment_proof_tag(attachment_id, proof_tag_id)


def rotate_attachment_for_manager(attachment_id, angle):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot rotate attachment now")

    return attachment_service.rotate(attachment_id, angle)
