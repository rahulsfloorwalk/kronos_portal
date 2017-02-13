from django.db.models import Model, CharField, AutoField, PositiveIntegerField, ForeignKey, OneToOneField
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
class Attachment(Model):

    PHOTO = 'PHOTO'
    AUDIO = 'AUDIO'
    VIDEO = 'VIDEO'
    PROOF_TYPE = (
        (PHOTO, "Photo"),
        (AUDIO, "Audio"),
        (AUDIO, "Video"),
    )

    ATTACHED = 'ATTACHED'
    DELETED = 'DELETED'
    STATUS = (
        (ATTACHED, "Attached"),
        (DELETED, "Deleted"),
    )

    id = AutoField(db_column='id', primary_key=True)
    file_slug = CharField(db_column='file_slug', max_length=200, blank=False)
    proof_type = CharField(db_column='proof_type', max_length=20, blank=False)
    mime_type = CharField(db_column='mime_type', max_length=20, blank=False)
    file_name = CharField(db_column='file_name', max_length=40, blank=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)

    content_type = ForeignKey(ContentType)
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
