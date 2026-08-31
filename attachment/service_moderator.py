
from kronos.exceptions import AppLogicError

import audit_store.service_moderator as audit_store_service
import answer.service.report_section_moderator as report_section_moderator_service
import answer.service.answer_moderator as answer_moderator_service

from . import service as attachment_service
import audit_store.service as audit_store_service_section
from answer.service import report_section as report_section_service
from audit_store.models import AuditStore
from django.db.transaction import atomic
from attachment.models import Attachment
from audit_store.models import AuditStore
from django.contrib.contenttypes.models import ContentType
from django.db.models import Prefetch
import questionnaire.service.section as section_service
from answer.models import ReportSection
from rest_framework.exceptions import ValidationError

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

def create_or_update_highlighted_attachment(audit_store_id,attachment_id,file_name,file_size,mime_type):
    audit_store = audit_store_service_section.find_by_id(audit_store_id)
    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot edit attachment now")

    return attachment_service.upload_for_audit_store_highlighted(audit_store_id,file_name,file_size,mime_type,attachment_id)

def create_or_update_section_highlighted_attachment(audit_store_id,section_id,attachment_id,file_name,file_size,mime_type):
    audit_store = audit_store_service_section.find_by_id(audit_store_id)

    if not audit_store.is_editable_by_manager():
        raise AppLogicError( "cannot edit attachment now")
    return attachment_service.upload_for_report_section_highlighted(audit_store_id,section_id,file_name,file_size,mime_type,attachment_id)


def find_by_audit_store_for_moderator_attachment(audit_store_id,attachment_id):
    attachments = find_by_audit_store_for_moderator_attachments(audit_store_id)
    for attachment in attachments:
        if attachment.id == attachment_id:
            return attachment
    raise Attachment.DoesNotExist

def find_by_audit_store_for_moderator_attachments(audit_store_id):
    content_type = ContentType.objects.get_for_model(AuditStore)
    # edited_attachments = Attachment.objects.filter(content_type=content_type,object_id=audit_store_id,is_edited=True
    # ).exclude(status=Attachment.DELETED)
    edited_attachments = Attachment.objects.filter(content_type=content_type,object_id=audit_store_id,is_edited=True,status=Attachment.ATTACHED).order_by('id')
    original_attachments = (
        Attachment.objects.filter(content_type=content_type,object_id=audit_store_id,is_edited=False,status=Attachment.ATTACHED)
        .prefetch_related(Prefetch('edited_attachments',queryset=edited_attachments,to_attr='active_edited_attachments')).order_by('id')
    )

    # original_attachments = (
    #     Attachment.objects.filter(content_type=content_type,object_id=audit_store_id,is_edited=False)
    #     .exclude(status=Attachment.DELETED)
    #     .prefetch_related(Prefetch('edited_attachments',queryset=edited_attachments, to_attr='active_edited_attachments')))
    result = []
    for original_attachment in original_attachments:
        edited = getattr( original_attachment, 'active_edited_attachments', [])
        if edited:
            result.append(edited[0])
        else:
            result.append(original_attachment)

    return result


def find_by_audit_store_section_for_moderator_attachment(audit_store_id,section_id,attachment_id):
    attachments = (find_by_audit_store_section_for_moderator_attachments(audit_store_id,section_id))
    for attachment in attachments:
        if attachment.id == attachment_id:
            return attachment
    raise Attachment.DoesNotExist

def find_by_audit_store_section_for_moderator_attachments(audit_store_id,section_id,user):
    audit_store = audit_store_service_section.find_by_id(audit_store_id)
    section = section_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id,section_id)

    try:
        report_section = ReportSection.objects.get(audit_store_id=audit_store.id,section_id=section.id)
    except ReportSection.DoesNotExist:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
        report_section.save()

    content_type = ContentType.objects.get_for_model(ReportSection)
    # edited_attachments = Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=True).exclude(status=Attachment.DELETED)
    edited_attachments = Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=True,status=Attachment.ATTACHED).order_by('id')

    original_attachments = (
        Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=False,status=Attachment.ATTACHED)
        .prefetch_related(
            Prefetch('edited_attachments',queryset=edited_attachments,to_attr='active_edited_attachments')
        ).order_by('id')
    )
    # original_attachments = (
    #     Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=False)
    #     .exclude( status=Attachment.DELETED)
    #     .prefetch_related(
    #         Prefetch('edited_attachments',queryset=edited_attachments,to_attr='active_edited_attachments'))
    # )
    result = []

    for original_attachment in original_attachments:
        edited = getattr(original_attachment,'active_edited_attachments',[] )
        if edited:
            result.append(edited[0])
        else:
            result.append(original_attachment)
    return result


def find_by_audit_store_section_for_moderator_attachment_comment(audit_store_id,section_id,attachment_id,user_id):
    attachments = (find_by_audit_store_section_for_moderator_attachments_comment(audit_store_id,section_id,user_id))
    for attachment in attachments:
        if attachment.id == attachment_id:
            return attachment

    raise Attachment.DoesNotExist

def find_by_audit_store_section_for_moderator_attachments_comment(audit_store_id,section_id,user_id):
    audit_store = audit_store_service_section.find_by_id(audit_store_id)
    section = section_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id,section_id)
    try:
        report_section = ReportSection.objects.get(audit_store_id=audit_store.id,section_id=section.id)

    except ReportSection.DoesNotExist:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
        report_section.save()

    content_type = ContentType.objects.get_for_model(ReportSection)
    edited_attachments = (
        Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=True)
        .exclude(status=Attachment.DELETED))

    original_attachments = (
        Attachment.objects.filter(content_type=content_type,object_id=report_section.id,is_edited=False)
        .exclude(status=Attachment.DELETED)
        .prefetch_related(
            Prefetch('edited_attachments',queryset=edited_attachments,to_attr='active_edited_attachments')))

    result = []

    for original_attachment in original_attachments:
        edited = getattr(original_attachment,'active_edited_attachments',[])
        if edited:
            result.append(edited[0])
        else:
            result.append(original_attachment)

    return result

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

def update_attachment_comments_for_section_comment(audit_store_id,section_id,attachments,user_id):

    audit_store = audit_store_service_section.find_by_id(audit_store_id)
    if not audit_store.is_editable_by_manager():
        raise AppLogicError("cannot edit attachment now")

    for attachment_data in attachments:
        attachment_id = attachment_data.get("attachment_id")
        attachment_comment = attachment_data.get("attachment_comment","")

        if not attachment_id:
            raise ValidationError({"attachment_id": "Attachment id is required"})

        attachment = (find_by_audit_store_section_for_moderator_attachment_comment(audit_store_id,section_id,attachment_id,user_id))
        if attachment.status != Attachment.ATTACHED:
            raise ValidationError({"attachment_id": "Attachment is not attached"})

        attachment.attachment_comment = attachment_comment
        attachment.save(update_fields=["attachment_comment"])

    return True


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
