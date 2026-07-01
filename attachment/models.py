from django.utils import timezone
from django.conf import settings
from django.db.models import Model, CharField, AutoField, PositiveIntegerField, ForeignKey, IntegerField, PROTECT, DateTimeField
from django.contrib.postgres.fields import JSONField
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from audit.models.proof_tag import AuditCycleProofTagList
import argparse
import logging
from botocore.client import Config
import boto3
from botocore.exceptions import ClientError
import requests
from botocore.client import Config
class Attachment(Model):

    PHOTO = 'PHOTO'
    AUDIO = 'AUDIO'
    VIDEO = 'VIDEO'
    ID_PROOF = 'ID_PROOF'
    OTHER = 'OTHER'
    PROOF_TYPE = (
        (PHOTO, "Photo"),
        (AUDIO, "Audio"),
        (VIDEO, "Video"),
        (ID_PROOF, "ID Proof")
    )

    GUIDELINE = "GUIDELINE"
    REFERENCE_ATTACHMENT = "REFERENCE_ATTACHMENT"
    AUDIT_STORE = "AUDIT_STORE"
    ATTACHMENT_CATEGORY = (
        (GUIDELINE, "Guideline"),
        (REFERENCE_ATTACHMENT, "Reference Attachment"),
        (AUDIT_STORE, "Audit Store"),
    )

    UPLOADING = 'UPLOADING'
    ATTACHED = 'ATTACHED'
    DELETED = 'DELETED'
    STATUS = (
        (UPLOADING, "Uploading"),
        (ATTACHED, "Attached"),
        (DELETED, "Deleted"),
    )

    id = AutoField(db_column='id', primary_key=True)
    file_slug = CharField(db_column='file_slug', max_length=200, blank=False)
    proof_type = CharField(db_column='proof_type', max_length=20, choices=PROOF_TYPE, blank=False)
    mime_type = CharField(db_column='mime_type', max_length=256, blank=False)
    file_name = CharField(db_column='file_name', max_length=256, blank=False)
    old_file_name = CharField(db_column='old_file_name', max_length=256,null=True, blank=True, default="")
    file_size = IntegerField(db_column='file_size')
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    attachment_category = CharField(db_column='attachment_category', max_length=20, choices=ATTACHMENT_CATEGORY, null=True, blank=True)
    link_url = CharField(db_column="link_url",max_length=3000,null=True,blank=True)
    
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)
    completed_at = DateTimeField(db_column="completed_at", null=True)

    content_type = ForeignKey(ContentType, on_delete=PROTECT)
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    image_hash = CharField(db_column="image_hash", max_length=500, blank=True)
    attachment_id = CharField(db_column="attachment_id", max_length=50, blank=True)

    proof_tag = ForeignKey(AuditCycleProofTagList, db_column='proof_tag_id', blank=True, null=True, default="", on_delete=PROTECT)

    extra_properties = JSONField(db_column='extra_properties', default=dict)

    audio_transcript_data = JSONField(db_column='audio_transcript_data', default=dict)
    audio_to_text_row = JSONField(db_column='audio_to_text_row', default=dict,blank=True, null=True)
    audio_to_text_clean = JSONField(db_column='audio_to_text_clean', default=dict,blank=True, null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(Attachment, self).save(*args, **kwargs)

    def direct_url(self):
        s3 = settings.AWS["S3_ATTACHMENTS"]
        return "https://s3-{}.amazonaws.com/{}/{}".format(s3["REGION"],s3["BUCKET"],self.file_slug)


    def generate_presigned_url(self):
        AWS = settings.AWS
        s3 = boto3.client(
            's3',
            aws_access_key_id=AWS["S3_ATTACHMENTS"]["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=AWS["S3_ATTACHMENTS"]["AWS_SECRET_ACCESS_KEY"],
            region_name=AWS["S3_ATTACHMENTS"]['REGION'],
            config=Config(signature_version='s3v4')
        )
        content_type = 'application/pdf'
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': AWS["S3_ATTACHMENTS"]["BUCKET"],
                'Key': self.file_slug,
                'ResponseContentType': content_type,
            },
            ExpiresIn=172800  # 2 days in seconds
        )

        return presigned_url
    
    '''def extra(self):
        if self.proof_type == self.PHOTO:
            subdomain = settings.IMGIX_SUBDOMAIN
            thumbnail_width = 150
            thumbnail_height = 100
            preview_height = 500
            return {
                "thumbnail_url": "https://{}/{}?fit=crop&auto=enhance,compress&crop=entropy&w={}&h={}".format(subdomain,self.file_slug,thumbnail_width,thumbnail_height),
                "preview_url": "https://{}/{}?auto=enhance,compress&h={}".format(subdomain,self.file_slug,preview_height)
            }
        else:
            return {}'''

    def get_rotate_angle(self):
        if self.extra_properties:
            return self.extra_properties['rotate_angle']
        else:
            return 0

    def extra(self):
        if self.proof_type == self.PHOTO:
            subdomain = settings.THUMBOR_SUBDOMAIN
            thumbnail_width = 150
            thumbnail_height = 100
            preview_width = 0
            preview_height = 500
            rotate_angle = self.get_rotate_angle()

            s3 = settings.AWS["S3_ATTACHMENTS"]
            s3_url = "https://s3-{}.amazonaws.com/{}".format(s3["REGION"], s3["BUCKET"])
            return {
                "thumbnail_url": "https://{}/unsafe/{}x{}/filters:rotate({})/{}/{}".format(subdomain, thumbnail_width, thumbnail_height, rotate_angle, s3_url, self.file_slug),
                "preview_url": "https://{}/unsafe/{}x{}/filters:rotate({})/{}/{}".format(subdomain, preview_width, preview_height, rotate_angle, s3_url, self.file_slug),
            }
        else:
            return {}

    def faulty_report_id(self):
        if self.attachment_id:
            attachment_obj = Attachment.objects.get(id=self.attachment_id)
            app_label, model = attachment_obj.content_type.app_label,attachment_obj.content_type.model
            if app_label == "answer" and model == "reportsection":
                return attachment_obj.content_object.audit_store.id
            elif app_label == "audit_store" and model == "auditstore":
                return attachment_obj.content_object.id
            else:
                return None

    def faulty_attachment_url(self):
        if self.attachment_id:
            attachment_obj = Attachment.objects.get(id=self.attachment_id)
            url = attachment_obj.extra()
            return url['preview_url']
        else:
            return None
