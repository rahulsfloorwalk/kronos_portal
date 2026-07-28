
from kronos.exceptions import AppLogicError

import audit_store.service_moderator as audit_store_service
import answer.service.report_section_moderator as report_section_moderator_service
import answer.service.answer_moderator as answer_moderator_service

from . import service as attachment_service
import audit_store.service as audit_store_service_section
from answer.service import report_section as report_section_service
from audit_store.models import AuditStore
from django.db.transaction import atomic

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id):
    report_section = report_section_moderator_service.find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)

def find_by_audit_store_for_moderator_mandatory_proof(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    return attachment_service.find_by_audit_store_mandatory_proof(audit_store.id)

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

@atomic
def set_report_submission_time(audit_store_id, user_id, moderator_submission_time):
    audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        duration = moderator_submission_time
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.moderator_submission_time = duration
        audit_store.save()
        return audit_store
    else:
        raise AppLogicError("Cannot set set report submission time of current audit store")

def delete_for_moderator(attachment_id, user_id):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot delete attachment now")

    return attachment_service.delete(attachment_id)

def move_to_section(audit_store_id,section_id,attachment_list):
    if not attachment_list and not section_id:
        raise AppLogicError("Please select attachment and section in which attachment to be moved")
    if not attachment_list:
        raise AppLogicError("Please select attachment to be moved")
    if not section_id:
        raise AppLogicError("Please select section to move attachment")
    audit_store = audit_store_service_section.find_by_id(audit_store_id)
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


def rotate_image_attachment_by_id(attachment_id, user_id, angle):
    audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)
    audit_store_service.find_by_id_for_moderator(audit_store.id, user_id)

    if not audit_store.is_editable_by_moderator():
        raise AppLogicError("cannot rotate attachment now")

    return attachment_service.rotate(attachment_id, angle)


# def find_attachment_by_audit_store_id(audit_store_id:int):
#     audit_store = AuditStore.objects.get(id=audit_store_id)
#     return attachment_service.find_by_audit_cycle_id(audit_store.audit.audit_cycle.id)

def find_attachment_by_audit_store_id(audit_store_id: int):
    audit_store = AuditStore.objects.filter(id=audit_store_id).first()
    if audit_store is None:
        return None
    # return attachment_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)
    return attachment_service.find_by_audit_cycle_for_guideline(audit_store.audit.audit_cycle.id)
    # return attachment_service.find_by_audit_cycle_id(audit_store.audit.audit_cycle.id)
