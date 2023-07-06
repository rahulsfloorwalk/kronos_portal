import logging
import random
import string
from datetime import date
import os
from typing import Tuple, Dict
from django.db.transaction import atomic

from django.utils import timezone
from django.conf import settings

import boto3
from botocore.client import Config

from PIL import Image, ImageFile
import imagehash
import requests
from io import BytesIO

from kronos.exceptions import AppLogicError, ObjectNotFound
import audit_store.service as audit_store_service
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from django.contrib.contenttypes.models import ContentType

from answer.service import report_section as report_section_service
from answer.service import answer as answer_service
from auditor.models import ProfileInfo
from auditor.service import profile_info_service
from .models import Attachment
from audit.service import audit_cycle_proof_tag
from questionnaire.service.section_proof_tag import get_section_id_by_audit_cycle_proof_tag_id
from answer.service import report_section as answer_service_report_section
from manager.service import solution_service
from manager.models import MPSolution
_logger = logging.getLogger(__name__)
ImageFile.LOAD_TRUNCATED_IMAGES = True


def check_file_size(file_size: int) -> None:
    if int(file_size) < settings.AWS["S3_ATTACHMENTS"]["MIN_SIZE"]:
        raise AppLogicError("file is too small")

    if int(file_size) > settings.AWS["S3_ATTACHMENTS"]["MAX_SIZE"]:
        raise AppLogicError("file is too large")

def get_proof_type(mime_type: str) -> str:
    parts = mime_type.split("/")
    return {
        "image": Attachment.PHOTO,
        "audio": Attachment.AUDIO,
        "video": Attachment.VIDEO,
    }.get(parts[0]) or Attachment.OTHER

def parse_file_name(file_name: str) -> Tuple[str, str]:
    return os.path.splitext(os.path.basename(file_name))

def valid_file_type(mime_type: str, file_extension: str) -> str:
    if mime_type is None or file_extension == '':
        raise AppLogicError("unknown file type")

def upload_for_object(proof_type: str, mime_type: str, file_name: str, file_size: int, file_slug: str, content_object) -> Attachment:
    return Attachment.objects.create(
        status = Attachment.UPLOADING,
        proof_type = proof_type,
        mime_type = mime_type,
        file_name = file_name,
        file_size = file_size,
        file_slug = file_slug,
        content_object = content_object,
    )

def update_attachment_section(attachment_id,content_object) -> Attachment:
    obj = Attachment.objects.get(id=attachment_id)
    obj.content_object=content_object
    obj.save()
    return obj

def generate_attachment_slug(file_extension):
    file_name = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(settings.AWS["S3_ATTACHMENTS"]["FILE_SLUG_SIZE"]))
    return "ATTACHMENTS/{}/{}{}".format(date.today().strftime("%Y/%m/%d"), file_name, file_extension)


def get_signed_post(file_extension):
    AWS = settings.AWS

    # Get the service client
    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS["S3_ATTACHMENTS"]["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=AWS["S3_ATTACHMENTS"]["AWS_SECRET_ACCESS_KEY"],
        region_name=AWS["S3_ATTACHMENTS"]["REGION"],
        config=Config(signature_version='s3v4')
    )

    # Make sure everything posted is publicly readable
    fields = {"acl": "public-read"}

    # Ensure that the ACL isn't changed and restrict the user to a length
    # between MIN_SIZE and MAX_SIZE.
    conditions = [
        {"acl": "public-read"},
        ["content-length-range", AWS["S3_ATTACHMENTS"]["MIN_SIZE"], AWS["S3_ATTACHMENTS"]["MAX_SIZE"]],
        {"bucket": AWS["S3_ATTACHMENTS"]["BUCKET"]},
        {"success_action_status": "201"},
    ]
    # Generate the POST attributes
    post = s3.generate_presigned_post(
        Bucket=AWS["S3_ATTACHMENTS"]["BUCKET"],
        Key=generate_attachment_slug(file_extension),
        Fields=fields,
        Conditions=conditions
    )
    return post

def save_image_hash(attachment):
    mime_type = attachment.mime_type
    try:
        if "image" in mime_type:
            app_label, model = attachment.content_type.app_label, attachment.content_type.model
            if (app_label == "answer" and model == "reportsection") or (app_label == "audit_store" and model == "auditstore"):
                response = requests.get(attachment.direct_url())
                if response.status_code == 200:
                    img_hash = imagehash.average_hash(Image.open(BytesIO(response.content)))
                    attachment.image_hash = img_hash
                    attachment.save()
                    return True
    except RuntimeError:
        return False

def complete(attachment_id):
    attachment = find_by_id(attachment_id)
    attachment.status = Attachment.ATTACHED
    attachment.completed_at = timezone.now()
    attachment.save()
    save_image_hash(attachment)
    return attachment


def upload_for_audit_store(audit_store_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    check_file_size(file_size)
    basename, file_extension = parse_file_name(file_name)
    valid_file_type(mime_type, file_extension)
    proof_type = get_proof_type(mime_type)
    post_data = get_signed_post(file_extension)
    attachment = upload_for_object(proof_type, mime_type, file_name, file_size, post_data["fields"]["key"], audit_store)
    return (post_data, attachment)

def upload_for_solution(solution_id, file_name, file_size, mime_type):
    solution = solution_service.find_by_id(solution_id)
    check_file_size(file_size)
    basename, file_extension = parse_file_name(file_name)
    valid_file_type(mime_type, file_extension)
    proof_type = get_proof_type(mime_type)
    post_data = get_signed_post(file_extension)
    attachment = upload_for_object(proof_type, mime_type, file_name, file_size, post_data["fields"]["key"], solution)
    return (post_data, attachment)

def upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    report_section = report_section_service.find_by_audit_store_and_section(audit_store.id, section_id)
    check_file_size(file_size)
    basename, file_extension = parse_file_name(file_name)
    valid_file_type(mime_type, file_extension)
    proof_type = get_proof_type(mime_type)
    post_data = get_signed_post(file_extension)
    attachment = upload_for_object(proof_type, mime_type, file_name, file_size, post_data["fields"]["key"], report_section)
    return (post_data, attachment)

def upload_for_answer(audit_store_id: int, question_id: int, file_name: str, file_size: int, mime_type: str) -> Tuple[Dict, Attachment]:
    audit_store = audit_store_service.find_by_id(audit_store_id)
    answer = answer_service.find_by_audit_store_and_question(audit_store.id, question_id)
    check_file_size(file_size)
    basename, file_extension = parse_file_name(file_name)
    valid_file_type(mime_type, file_extension)
    proof_type = get_proof_type(mime_type)
    post_data = get_signed_post(file_extension)
    attachment = upload_for_object(proof_type, mime_type, file_name, file_size, post_data["fields"]["key"], answer)
    return (post_data, attachment)

def upload_for_id_proof(user_id, file_name, file_size, mime_type):
    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
    check_file_size(file_size)

    basename, file_extension = parse_file_name(file_name)
    if mime_type is None or file_extension == '':
        raise AppLogicError("invalid file type (only image or PDF supported)")

    if mime_type.startswith("image/") or mime_type == "application/pdf":
        proof_type = Attachment.ID_PROOF
    else:
        raise AppLogicError("invalid file type (only image or PDF supported)")

    post_data = get_signed_post(file_extension)
    attachment = upload_for_object(proof_type, mime_type, file_name, file_size, post_data["fields"]["key"], profile_info)
    return (post_data, attachment)

def get_audit_store_for_attachment(attachment_id):
    try:
        attachment = find_by_id(attachment_id)
        if attachment.content_type.model_class() is AuditStore:
            return AuditStore.objects.get(pk=attachment.object_id)

        if attachment.content_type.model_class() is Answer:
            return Answer.objects.get(pk=attachment.object_id).audit_store

        if attachment.content_type.model_class() is ReportSection:
            return ReportSection.objects.get(pk=attachment.object_id).audit_store

        raise AppLogicError("Invalid Attachment Content Type")
    except (AuditStore.DoesNotExist, Answer.DoesNotExist, ReportSection.DoesNotExist) as e:
        _logger.warn("found orphan attachment with ID: %s", attachment_id)
        raise ObjectNotFound from e

def get_auditor_for_attachment(attachment_id: int) -> ProfileInfo:
    attachment = find_by_id(attachment_id)
    if attachment.content_type.model_class() is ProfileInfo:
        return profile_info_service.find_profile_info_by_id(attachment.object_id)

    raise AppLogicError("Invalid Attachment Content Type")
def get_solution_for_attachment(attachment_id: int) -> MPSolution:
    attachment = find_by_id(attachment_id)
    if attachment.content_type.model_class() is MPSolution:
        return solution_service.find_by_id(attachment.object_id)

def find_by_audit_store(audit_store_id):
    return Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED).order_by('id')

def find_by_solution(solution_id):
    return Attachment.objects.filter(solutions__id=solution_id,status=Attachment.ATTACHED).order_by('id')
def find_by_audit_store_and_section(audit_store_id, section_id):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)
    return Attachment.objects.filter(report_sections__id=report_section.id, status=Attachment.ATTACHED).order_by('id')

def find_by_profile_info(profile_info_id):
    return Attachment.objects.filter(profile_infos__id=profile_info_id, status=Attachment.ATTACHED)


def delete(attachment_id):
    attachment = find_by_id(attachment_id)
    attachment.status = Attachment.DELETED
    attachment.save()


def rename(attachment_id, new_name):
    attachment = find_by_id(attachment_id)

    if new_name in ["", None]:
        raise AppLogicError("new file name is invalid")

    attachment.file_name = new_name
    attachment.save()
    return attachment


def save_attachment_proof_tag(attachment_id, proof_tag_id):
    attachment = find_by_id(attachment_id)
    if proof_tag_id == "":
        attachment.proof_tag = None
    else:
        proof_tag_obj = audit_cycle_proof_tag.find_by_id(proof_tag_id)
        attachment.proof_tag = proof_tag_obj
        attachment_file_name = attachment.file_name
        if "." in attachment_file_name:
            extension = attachment_file_name.split(".")[-1]
            attachment.file_name = proof_tag_obj.proof_tag.name + "." + extension
        else:
            attachment.file_name = proof_tag_obj.proof_tag.name
    attachment.save()
    return attachment


def find_by_id(attachment_id):
    try:
        return Attachment.objects.exclude(status=Attachment.DELETED).get(pk=attachment_id)
    except Attachment.DoesNotExist as e:
        raise ObjectNotFound from e


def find_by_audit_store_list(audit_store_list, proof_tag_id):
    return Attachment.objects.filter(audit_stores__id__in=audit_store_list, status=Attachment.ATTACHED, proof_tag__proof_tag__id=proof_tag_id)\
        .order_by('id')


def find_by_report_section_list(report_section_list, proof_tag_id):
    return Attachment.objects.filter(report_sections__id__in=report_section_list, status=Attachment.ATTACHED, proof_tag__proof_tag__id=proof_tag_id)\
        .order_by('id')


def rotate(attachment_id, angle):
    attachment = find_by_id(attachment_id)
    rotate_angle = attachment.get_rotate_angle()
    rotate_angle_data = {}
    if rotate_angle == 0:
        if angle == "left":
            new_rotate_angle = 0 + 90
        else:
            new_rotate_angle = 360 - 90
    else:
        if angle == "left":
            new_rotate_angle = rotate_angle + 90
        else:
            new_rotate_angle = rotate_angle - 90

    if new_rotate_angle >= 360 or new_rotate_angle < 0:
        rotate_angle_data['rotate_angle'] = 0
    else:
        rotate_angle_data['rotate_angle'] = new_rotate_angle

    attachment.extra_properties = rotate_angle_data
    attachment.save()
    return attachment


def update_attachment_by_proof_tag(audit_store_id, attachment_list):
    for attachment in attachment_list:
        if attachment.proof_tag:
            section_id = get_section_id_by_audit_cycle_proof_tag_id(attachment.proof_tag.id)
            if section_id:
                answer_section_id = answer_service_report_section.get_answer_section_id_by_section_id(audit_store_id, section_id)
                content_type_obj = ContentType.objects.get(app_label='answer', model='reportsection')
                attachment.content_type = content_type_obj
                attachment.object_id = answer_section_id
                attachment.save()
            else:
                content_type_obj = ContentType.objects.get(app_label='audit_store', model='auditstore')
                attachment.content_type = content_type_obj
                attachment.object_id = audit_store_id
                attachment.save()


def set_attachment_by_proof_tag(audit_store_id):
    audit_store_attachment = Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED)
    report_section_obj = answer_service_report_section.find_by_audit_store(audit_store_id)
    report_section_list = report_section_obj.values_list('id')
    report_section_attachment = Attachment.objects.filter(report_sections__id__in=report_section_list,
                                                          status=Attachment.ATTACHED)
    update_attachment_by_proof_tag(audit_store_id, audit_store_attachment)
    update_attachment_by_proof_tag(audit_store_id, report_section_attachment)
    return True

@atomic
def set_attachment_by_audit_store(audit_store_id):
    report_section_obj = answer_service_report_section.find_by_audit_store(audit_store_id)
    content_type_obj = ContentType.objects.get(app_label='audit_store', model='auditstore')

    for report_section in report_section_obj:
        report_section.attachments.filter(status=Attachment.ATTACHED).update(content_type = content_type_obj, object_id = audit_store_id)