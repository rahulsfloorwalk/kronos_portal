from django.utils import timezone
from django.conf import settings
from django.db.models import Model, CharField, AutoField, PositiveIntegerField, ForeignKey, IntegerField, PROTECT, DateTimeField
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

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
    file_size = IntegerField(db_column='file_size')
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)
    completed_at = DateTimeField(db_column="completed_at", null=True)

    content_type = ForeignKey(ContentType, on_delete=PROTECT)
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    image_hash = CharField(db_column="image_hash", max_length=500,blank=True)
    attachment_id = CharField(db_column="attachment_id",max_length=50,blank=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(Attachment, self).save(*args, **kwargs)

    def direct_url(self):
        s3 = settings.AWS["S3_ATTACHMENTS"]
        return "https://s3-{}.amazonaws.com/{}/{}".format(s3["REGION"],s3["BUCKET"],self.file_slug)

    def extra(self):
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