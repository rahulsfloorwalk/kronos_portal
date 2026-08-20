from kronos.exceptions import ObjectNotFound, AppLogicError

from auditor.models import ProfileInfo
from audit_store.models import AuditStore
import audit_store.service as audit_store_service
from auditor.service import profile_info_service
from answer.models import ReportSection
from answer.service import report_section_auditor as report_section_auditor_service
from answer.service import answer_auditor as answer_auditor_service
import answer.service.report_section as report_section_service
from . import service as attachment_service
from manager.models import AuditProoftagNotAvailable
from rest_framework.exceptions import ValidationError
from attachment.models import Attachment
from django.contrib.contenttypes.models import ContentType
import questionnaire.service.section as section_service
from django.db.models import Prefetch
from questionnaire.models.proof_tag import SectionProofTag


def upload_for_audit_store_by_auditor(audit_store_id: int, user_id: int, file_name: str, file_size: str, mime_type: str,attachment_comment=""):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type,attachment_comment)

def upload_prooftag_not_available_for_audit_store_by_auditor(audit_store_id: int, user_id: int, proof_tag, description):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.upload_prooftag_not_available_for_object(audit_store.id, proof_tag, description,user_id)

def upload_prooftag_not_available_for_audit_store_by_auditor_moderator(audit_store_id: int, proof_tag, description):
    audit_store = audit_store_service.find_by_id_for_auditor_for_moderator(audit_store_id)
    return attachment_service.upload_prooftag_not_available_for_object(audit_store.id, proof_tag, description)

def upload_for_audit_store_by_auditor_with_proof_tag(audit_store_id: int, user_id: int, file_name: str, file_size: str, mime_type: str,proof_tag):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.upload_for_audit_store_with_proof_tag(audit_store.id, file_name, file_size, mime_type,proof_tag)


def upload_for_report_section_by_auditor(audit_store_id: int, section_id: int, file_name: str, file_size: str, mime_type: str, user_id: int):
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.upload_for_report_section(audit_store_id, report_section.section_id, file_name, file_size, mime_type)

def upload_for_answer_by_auditor(audit_store_id: int, question_id: int, file_name: str, file_size: str, mime_type: str, user_id: int):
    answer = answer_auditor_service.find_by_audit_store_and_question_for_auditor(audit_store_id, question_id, user_id)
    return attachment_service.upload_for_answer(audit_store_id, answer.question_id, file_name, file_size, mime_type)


def find_by_audit_store_for_auditor(audit_store_id: int, user_id: int):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return attachment_service.find_by_audit_store(audit_store.id)

def find_by_audit_store_for_auditor_prooftag_not_available(audit_store_id: int, user_id: int):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    if audit_store is None:
        return AuditProoftagNotAvailable.objects.none()
    return attachment_service.find_prooftag_not_available_by_audit_store(audit_store.id)

def find_by_audit_store_for_auditor_prooftag_not_available_for_moderator(audit_store_id: int):
    audit_store = audit_store_service.find_by_id_for_auditor_for_moderator(audit_store_id)
    if audit_store is None:
        return AuditProoftagNotAvailable.objects.none()
    return attachment_service.find_prooftag_not_available_by_audit_store(audit_store.id)

def find_attachment_by_audit_store_id(audit_store_id:int):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    # return attachment_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)
    return attachment_service.find_by_audit_cycle_for_guideline(audit_store.audit.audit_cycle.id)
    

def find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id):
    report_section = report_section_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, user_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)

def find_id_proof_for_auditor(user_id):
    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
    return attachment_service.find_by_profile_info(profile_info.id)

def complete_for_auditor(attachment_id, user_id):

    attachment = attachment_service.find_by_id(attachment_id)

    if attachment.content_type.model_class() in (AuditStore, ReportSection):
        audit_store = attachment_service.get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status != AuditStore.ACKNOWLEDGED:
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

        if audit_store.status != AuditStore.ACKNOWLEDGED:
            raise AppLogicError("cannot delete attachment now")

    elif attachment.content_type.model_class() == ProfileInfo:
        profile_info = attachment_service.get_auditor_for_attachment(attachment_id)

        if profile_info.user.id != user_id:
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.delete(attachment_id)

def upload_for_id_proof_by_auditor(user_id, file_name, file_size, mime_type):
    return attachment_service.upload_for_id_proof(user_id, file_name, file_size, mime_type)

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

def update_attachment_comments_for_section(audit_store_id,section_id,attachments,user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id,user_id)
    for attachment_data in attachments:
        attachment_id = attachment_data.get("attachment_id")
        attachment_comment = attachment_data.get("attachment_comment","")

        if not attachment_id:
            raise ValidationError({"attachment_id": "Attachment id is required"})

        attachment = (
            find_by_audit_store_section_for_auditor_attachment_comment(audit_store_id,section_id,attachment_id,user_id)
        )

        if attachment.status != Attachment.ATTACHED:
            raise ValidationError({"attachment_id": "Attachment is not attached"})

        attachment.attachment_comment = attachment_comment
        attachment.save(update_fields=["attachment_comment"])

    return True

def find_by_audit_store_section_for_auditor_attachments_comment(audit_store_id,section_id,user_id):

    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id,user_id)
    content_type = ContentType.objects.get_for_model(AuditStore)

    # Get only proof tags configured for this section
    section_proof_tag_ids = (
        SectionProofTag.objects.filter(section_id=section_id,
            audit_cycle_proof_tag__audit_cycle_id=audit_store.audit.audit_cycle_id
        )
        .values_list('audit_cycle_proof_tag_id',flat=True)
    )

    # Get only attachments having those proof tags
    attachments = (
        Attachment.objects.filter(content_type=content_type,object_id=audit_store.id,proof_tag_id__in=section_proof_tag_ids
        ).exclude(status=Attachment.DELETED))

    return attachments

def find_by_audit_store_section_for_auditor_attachment_comment(audit_store_id,section_id,attachment_id,user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id,user_id)
    content_type = ContentType.objects.get_for_model(AuditStore)

    attachment = (
        Attachment.objects.filter(id=attachment_id,content_type=content_type,
            object_id=audit_store.id,proof_tag__section_proof_tag__section_id=section_id
        ).exclude(status=Attachment.DELETED).first())

    if not attachment:
        raise Attachment.DoesNotExist

    return attachment
