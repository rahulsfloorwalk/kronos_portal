from django.conf import settings
from django.db.models import Model, CharField, AutoField, PositiveIntegerField, ForeignKey, OneToOneField, IntegerField
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
    CANCELED = 'CANCELED'
    ATTACHED = 'ATTACHED'
    DELETED = 'DELETED'
    STATUS = (
        (ATTACHED, "Attached"),
        (DELETED, "Deleted"),
    )

    id = AutoField(db_column='id', primary_key=True)
    file_slug = CharField(db_column='file_slug', max_length=200, blank=False)
    proof_type = CharField(db_column='proof_type', max_length=20, choices=PROOF_TYPE, blank=False)
    mime_type = CharField(db_column='mime_type', max_length=50, blank=False)
    file_name = CharField(db_column='file_name', max_length=256, blank=False)
    file_size = IntegerField(db_column='file_size')
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)

    content_type = ForeignKey(ContentType)
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def direct_url(self):
        s3 = settings.AWS["S3_ATTACHMENTS"]
        return "https://s3-{}.amazonaws.com/{}/{}".format(s3["REGION"],s3["BUCKET"],self.file_slug)

    def extra(self):
        if self.proof_type == self.PHOTO:
            subdomain = settings.IMGIX_SUBDOMAIN
            thumbnail_width = 150
            thumbnail_height = 100
            preview_width = 750
            preview_height = 500
            return {
                    "thumbnail_url": "https://{}/{}?fit=crop&auto=enhance,compress&crop=entropy&w={}&h={}".format(subdomain,self.file_slug,thumbnail_width,thumbnail_height),
                    "preview_url": "https://{}/{}?auto=enhance,compress&h={}".format(subdomain,self.file_slug,preview_height)
            }
        else:
            return {}
