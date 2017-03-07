import random
import string
from datetime import date
import os

from django.conf import settings

import boto3

from kronos.exceptions import AppLogicError, ObjectNotFound
import audit_store.service as audit_store_service
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from .models import Attachment

AWS = settings.AWS

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
        #{"success_action_status": "201"},
    ]

    # Generate the POST attributes
    post = s3.generate_presigned_post(
        Bucket=AWS["S3_ATTACHMENTS"]["BUCKET"],
        Key=generate_attachment_slug(file_extension),
        Fields=fields,
        Conditions=conditions
    )
    return post


def upload_for_audit_store(audit_store_id, profileinfo_id, file_name, file_size, mime_type):
    audit_store = audit_store_service.get_audit_store(audit_store_id, profileinfo_id)

    if int(file_size) < int(AWS["S3_ATTACHMENTS"]["MIN_SIZE"]):
        raise AppLogicError("file is too small")

    if int(file_size) > int(AWS["S3_ATTACHMENTS"]["MAX_SIZE"]):
        raise AppLogicError("file is too large")

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


def get_audit_store_for_attachment(attachment_id):
    attachment = Attachment.objects.get(pk=attachment_id)
    if attachment.content_type.model_class() is AuditStore:
        return AuditStore.objects.get(pk=attachment.object_id)

    if attachment.content_type.model_class() is Answer:
        return Answer.objects.get(pk=attachment.object_id).audit_store

    if attachment.content_type.model_class() is ReportSection:
        return ReportSection.objects.get(pk=attachment.object_id).audit_store


def find_by_audit_store_for_auditor(audit_store_id, profileinfo_id):
    audit_store = audit_store_service.get_audit_store(audit_store_id, profileinfo_id)
    return Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED)

def find_by_audit_store_for_client(audit_store_id, client_id):
    audit_store = audit_store_service.find_by_id_for_client(audit_store_id, client_id)
    return Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED)


def find_by_audit_store(audit_store_id):
    return Attachment.objects.filter(audit_stores__id=audit_store_id, status=Attachment.ATTACHED)


def complete_for_user(attachment_id, user_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        audit_store = get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status == AuditStore.ASSIGNED:
            attachment.status = Attachment.ATTACHED
            attachment.save()
            return attachment
        else:
            raise AppLogicError("cannot attach attachment now")
    except (AuditStore.DoesNotExist, Attachment.DoesNotExist, Answer.DoesNotExist, ReportSection.DoesNotExist) as e:
        raise ObjectNotFound from e


def delete_for_user(attachment_id, user_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        audit_store = get_audit_store_for_attachment(attachment_id)

        if audit_store.user.id != user_id:
            raise ObjectNotFound

        if audit_store.status == AuditStore.ASSIGNED:
            attachment.status = Attachment.DELETED
            attachment.save()
        else:
            raise AppLogicError("cannot delete attachment now")
    except (AuditStore.DoesNotExist, Attachment.DoesNotExist) as e:
        raise ObjectNotFound from e


def delete(attachment_id):
    try:
        attachment = Attachment.objects.get(pk=attachment_id)
        audit_store = get_audit_store_for_attachment(attachment_id)

        if audit_store.status == AuditStore.SUBMITTED:
            attachment.status = Attachment.DELETED
            attachment.save()
        else:
            raise AppLogicError("cannot delete attachment now")
    except (AuditStore.DoesNotExist, Attachment.DoesNotExist) as e:
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
