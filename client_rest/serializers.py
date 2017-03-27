from rest_framework.serializers import Serializer, ModelSerializer, ValidationError, SlugRelatedField, PrimaryKeyRelatedField
from rest_framework.serializers import CharField, EmailField, BooleanField
from django.contrib.auth.models import User

from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from client.models import Client, Store, ClientUser
from manager.models import City, Location

from questionnaire.models import Section, Question
from answer.models import Answer, ReportSection
from attachment.models import Attachment

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
        )
        read_only_fields = ('id',)

class LocationSerializer(ModelSerializer):
    city = CitySerializer()

    class Meta:
        model = Location
        fields = (
            'id',
            'name',
            'pincode',
            'city',
        )
        read_only_fields = fields

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
            'logo_url'
        )
        read_only_fields = fields

class PlainUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
        )
        read_only_fields = fields

class ClientUserSerializer(ModelSerializer):
    user = PlainUserSerializer()
    client = ClientSerializer()
    class Meta:
        model = ClientUser
        fields = (
            'id',
            'full_name',
            'client',
            'user',
        )
        read_only_fields = fields

class AuditCycleSerializer(ModelSerializer):
    client = ClientSerializer()
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'type',
            'start_date',
            'end_date',
            'client',
        )
        read_only_fields = fields

class StoreSerializer(ModelSerializer):
    location = LocationSerializer()
    client = ClientSerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'location',
            'client',
        )
        read_only_fields = fields

class AuditSerializer(ModelSerializer):
    store = StoreSerializer()
    audit_cycle = AuditCycleSerializer()
    class Meta:
        model = Audit
        fields = (
            'id',
            'store',
            'audit_cycle',
        )
        read_only_fields = fields

class AuditStoreSerializer(ModelSerializer):
    audit = AuditSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'audit_date',
            'audit',
            'percentage'
        )
        read_only_fields = fields

class QuestionSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'section',
        )
        read_only_fields = fields

class SectionSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'questions',
            'max_marks'
        )
        read_only_fields = fields

class AnswerSerializer(ModelSerializer):
    class Meta:
        model = Answer
        fields = (
            'id',
            'question',
            'audit_store',
            'answer_text',
            'marks_obtained'
        )
        read_only_fields = fields

class ReportSectionSerializer(ModelSerializer):
    class Meta:
        model = ReportSection
        fields = (
            'id',
            'audit_store',
            'section',
            'auditor_comment',
            'pm_comment',
            'marks_obtained'
        )
        read_only_fields = fields

class AttachmentSerializer(ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            'id',
            'file_slug',
            'proof_type',
            'mime_type',
            'file_name',
            'status',
            'content_type',
            'object_id',
            'direct_url',
        )
        read_only_fields = fields

