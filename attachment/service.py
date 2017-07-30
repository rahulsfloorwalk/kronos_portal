import logging
import random
import string
from datetime import date
import os

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q

import boto3

from kronos.exceptions import AppLogicError, ObjectNotFound
import audit_store.service as audit_store_service
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from answer.service import report_section as report_section_service
from auditor.models import ProfileInfo
from .models import Attachment

AWS = settings.AWS

_logger = logging.getLogger(__name__)


def check_file_size(file_size):
    if int(file_size) < int(AWS["S3_ATTACHMENTS"]["MIN_SIZE"]):
        raise AppLogicError("file is too small")

    if int(file_size) > int(AWS["S3_ATTACHMENTS"]["MAX_SIZE"]):
        raise AppLogicError("file is too large")


def generate_attachment_slug(file_extension):
    file_name = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(AWS["S3_ATTACHMENTS"]["FILE_SLUG_SIZE"]))
    return "ATTACHMENTS/{}/{}{}".format(date.today().strftime("%Y/%m/%d"), file_name, file_extension)


def get_signed_post(file_extension):
    # Get the service client
    s3 = boto3.client('s3',
            aws_access_key_id=AWS["S3_ATTACHMENTS"]["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=AWS["S3_ATTACHMENTS"]["AWS_SECRET_ACCESS_KEY"],
            region_name=AWS["S3_ATTACHMENTS"]["REGION"]
        )

    # Make sure everything posted is publicly readable
    fields = {"acl": "public-read"}

    # Ensure that the ACL isn't changed and restrict the user to a length
    # between 10 and 100.
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


def complete(attachment_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        attachment.status = Attachment.ATTACHED
        attachment.save()
        return attachment
    except (Attachment.DoesNotExist) as e:
        raise ObjectNotFound from e


def upload_for_audit_store(audit_store_id, file_name, file_size, mime_type):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)

        check_file_size(file_size)

        basename, file_extension = os.path.splitext(file_name)
        if mime_type is None or file_extension == '':
            raise AppLogicError("could not detect file type, please ensure you upload a known file type")

        if mime_type.startswith("image/"):
            proof_type = Attachment.PHOTO
        elif mime_type.startswith("audio/"):
            proof_type = Attachment.AUDIO
        elif mime_type.startswith("video/"):
            proof_type = Attachment.VIDEO
        else:
            proof_type = Attachment.OTHER

        post_data = get_signed_post(file_extension)

        attachment = Attachment()
        attachment.status = Attachment.UPLOADING
        attachment.proof_type = proof_type
        attachment.mime_type = mime_type
        attachment.file_name = file_name
        attachment.file_size = file_size
        attachment.file_slug = post_data["fields"]["key"]
        attachment.content_object = audit_store

        attachment.save()

        return (post_data, attachment)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


def upload_for_report_section(audit_store_id, section_id, file_name, file_size, mime_type):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)

        check_file_size(file_size)

        basename, file_extension = os.path.splitext(file_name)
        if mime_type is None or file_extension == '':
            raise AppLogicError("could not detect file type, please ensure you upload a known file type")

        if mime_type.startswith("image/"):
            proof_type = Attachment.PHOTO
        elif mime_type.startswith("audio/"):
            proof_type = Attachment.AUDIO
        elif mime_type.startswith("video/"):
            proof_type = Attachment.VIDEO
        else:
            proof_type = Attachment.OTHER

        post_data = get_signed_post(file_extension)

        attachment = Attachment()
        attachment.status = Attachment.UPLOADING
        attachment.proof_type = proof_type
        attachment.mime_type = mime_type
        attachment.file_name = file_name
        attachment.file_size = file_size
        attachment.file_slug = post_data["fields"]["key"]
        attachment.content_object = report_section

        attachment.save()

        return (post_data, attachment)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def upload_for_id_proof(user_id, file_name, file_size, mime_type):
    try:
        profile_info = ProfileInfo.objects.get(user_id=user_id)
        check_file_size(file_size)

        basename, file_extension = os.path.splitext(file_name)
        if mime_type is None or file_extension == '':
            raise AppLogicError("could not detect file type, please ensure you upload a known file type")

        if mime_type.startswith("image/"):
            proof_type = Attachment.ID_PROOF
        else:
            raise AppLogicError("selected file is not an image file, please upload image file of known type")

        post_data = get_signed_post(file_extension)

        attachment = Attachment()
        attachment.status = Attachment.UPLOADING
        attachment.proof_type = proof_type
        attachment.mime_type = mime_type
        attachment.file_name = file_name
        attachment.file_size = file_size
        attachment.file_slug = post_data["fields"]["key"]
        attachment.content_object = profile_info

        attachment.save()

        return (post_data, attachment)
    except User.DoesNotExist as e:
        raise ObjectNotFound from e

def get_audit_store_for_attachment(attachment_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        if attachment.content_type.model_class() is AuditStore:
            return AuditStore.objects.get(pk=attachment.object_id)

        if attachment.content_type.model_class() is Answer:
            return Answer.objects.get(pk=attachment.object_id).audit_store

        if attachment.content_type.model_class() is ReportSection:
            return ReportSection.objects.get(pk=attachment.object_id).audit_store

        raise AppLogicError("Invalid Attachment Content Type")
    except Attachment.DoesNotExist as e:
        raise ObjectNotFound from e
    except (AuditStore.DoesNotExist, Answer.DoesNotExist, ReportSection.DoesNotExist) as e:
        _logger.warn("found orphan attachment with ID: %s", attachment_id)
        raise ObjectNotFound from e

def get_auditor_for_attachment(attachment_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        if attachment.content_type.model_class() is ProfileInfo:
            return ProfileInfo.objects.get(pk=attachment.object_id)

        raise AppLogicError("Invalid Attachment Content Type")

    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e



def find_by_audit_store(audit_store_id):
    return Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED)

def find_by_audit_store_and_section(audit_store_id, section_id):
    report_section = report_section_service.find_by_audit_store_and_section(audit_store_id, section_id)
    return Attachment.objects.filter(report_sections__id=report_section.id, status=Attachment.ATTACHED)

def find_by_profile_info(profile_info_id):
    return Attachment.objects.filter(profile_infos__id=profile_info_id, status=Attachment.ATTACHED)


def delete(attachment_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        attachment.status = Attachment.DELETED
        attachment.save()
    except (Attachment.DoesNotExist) as e:
        raise ObjectNotFound from e


def rename(attachment_id, new_name):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        audit_store = get_audit_store_for_attachment(attachment_id)

        if new_name in ["", None]:
            raise AppLogicError("new file name is invalid")

        if audit_store.status == AuditStore.SUBMITTED:
            attachment.file_name = new_name
            attachment.save()
            return attachment
        else:
            raise AppLogicError("cannot rename attachment now")
    except (AuditStore.DoesNotExist, Attachment.DoesNotExist) as e:
        raise ObjectNotFound from e
