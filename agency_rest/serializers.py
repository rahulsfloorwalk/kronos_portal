
from django.contrib.auth.models import User

from rest_framework.serializers import ModelSerializer

from manager.models import City
from registration.models import MobileNumber

from agency.models import Agency
from agency.models import AgencyUser
from agency.models import AgencyPresence

from answer.models import Answer, ReportSection
from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit
from attachment.models import Attachment
from client.models import Client, Store
from questionnaire.models import Question, Section


class AgencySerializer(ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            'id',
            'name',
            'formed_in_year',
            'gstin',
            'cin',
            'strength',
        )
        read_only_fields = ('id',)

class AgencyUserSerializer(ModelSerializer):
    agency = AgencySerializer()
    class Meta:
        model = AgencyUser
        fields = (
            'id',
            'full_name',
            'agency',
            'user_id',
        )
        read_only_fields = fields

class MobileNumberSerializer(ModelSerializer):
    class Meta:
        model = MobileNumber
        fields = (
            'id',
            'mobile_number',
            'is_verified',
            'user_id',
        )
        read_only_fields = fields

class UserSerializer(ModelSerializer):
    agencyuser = AgencyUserSerializer()
    mobile_numbers = MobileNumberSerializer(many=True)
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'agencyuser',
            'mobile_numbers',
        )


class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
            'lat',
            'lon',
        )
        read_only_fields = fields


class AgencyPresenceSerializer(ModelSerializer):
    class Meta:
        model = AgencyPresence
        fields = (
            'id',
            'present',
            'agency_id',
            'city_id',
        )
        read_only_fields = fields


class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'auditor_logo_url',
            'auditor_display_name',
        )
        read_only_fields = fields


class AuditCycleSerializer(ModelSerializer):
    client = ClientSerializer()
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'description',
            'post_approval_description',
            'client',
        )
        read_only_fields = fields


class StoreSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = Store
        fields = (
            'name',
            'address',
            'city',
            'phone',
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
            'earnings_per_audit',
            'reimbursement',
            'audit_cycle',
            'post_approval_description',
        )
        read_only_fields = fields


class AuditStoreSerializer(ModelSerializer):
    audit = AuditSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'is_editable_by_auditor',
        )
        read_only_fields = fields


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'question_type',
            'question_data',
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
            'questions'
        )
        read_only_fields = fields


class AnswerSerializer(ModelSerializer):
    class Meta:
        model = Answer
        fields = (
            'id',
            'question_id',
            'audit_store_id',
            'answer_text',
            'answer_comment',
        )
        read_only_fields = fields


class ReportSectionSerializer(ModelSerializer):
    class Meta:
        model = ReportSection
        fields = (
            'id',
            'audit_store',
            'audit_store_id',
            'section',
            'section_id',
            'auditor_comment'
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
            'extra',
        )
        read_only_fields = fields
