from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, DateField
from rest_framework.serializers import CharField, EmailField
from django.contrib.auth.models import User

from registration.models import MobileNumber
from agency.models import Agency, AgencyUser
from client.models import Client, Store
from manager.models import City
from audit.models import AuditCycle, Audit
from auditor.models import ProfileInfo
from audit_store.models import AuditStore
from questionnaire.models import Section, Question
from answer.models import ReportSection, Answer
from attachment.models import Attachment

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'logo_url',
        )
        read_only_fields = fields

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
            'lat',
            'lon',
            'gmaps_url',
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
    client = ClientSerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'city',
            'client',
        )
        read_only_fields = fields


class ProfileInfoSmallSerializer(ModelSerializer):
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'first_name',
            'last_name',
            'mobile_number',
            'city',
            'user_id'
        )
        read_only_fields = fields

class MobileNumberSerializer(ModelSerializer):
    class Meta:
        model = MobileNumber
        fields = (
            'mobile_number',
            'is_verified',
        )
        read_only_fields = fields


class AgencySmallSerializer(ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            'id',
            'name'
        )
        read_only_fields = fields


class AgencyUserInfoSerializer(ModelSerializer):
    agency = AgencySmallSerializer()

    class Meta:
        model = AgencyUser
        fields = (
            'id',
            'full_name',
            'agency',
            'user_id',
        )
        read_only_fields = fields


class UserSerializer(ModelSerializer):
    profileinfo = ProfileInfoSmallSerializer()
    agencyuser = AgencyUserInfoSerializer()
    mobile_numbers = MobileNumberSerializer(many=True)
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'mobile_numbers',
            'profileinfo',
            'agencyuser',
        )
        read_only_fields = fields

class AuditStoreSerializerWithoutAudit(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'qa_rating',
        )
        read_only_fields = fields


class AuditSerializerWithoutApplications(ModelSerializer):
    store = StoreSerializer()
    audit_cycle = AuditCycleSerializer()
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'post_approval_description',
        )
        read_only_fields = fields


class AuditStoreSerializer(ModelSerializer):
    audit = AuditSerializerWithoutApplications()
    user = UserSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'qa_rating',
            'earnings_per_audit',
            'report_summary',
            'reimbursement',
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
            'question_type',
            'question_data',
        )
        read_only_fields = fields


class QuestionDeSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'section',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            question = Question.objects.get(id=self.context.get('id'))
        else:
            question = Question()
        question.sequence = self.validated_data.get('sequence', question.sequence)
        question.question_txt = self.validated_data.get('question_txt', question.question_txt)
        question.max_marks = self.validated_data.get('max_marks', question.max_marks)
        question.section = self.validated_data.get('section', question.section_id)
        return question


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


class SectionDeSerializer(ModelSerializer):
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            section = Section.objects.get(id=self.context.get('id'))
        else:
            section = Section()
        section.name = self.validated_data.get('name', section.name)
        section.sequence = self.validated_data.get('sequence', section.sequence)
        section.audit_cycle = self.validated_data.get('audit_cycle', section.audit_cycle_id)
        return section


class AnswerSerializer(ModelSerializer):
    class Meta:
        model = Answer
        fields = (
            'id',
            'question',
            'audit_store',
            'answer_text',
            'answer_comment',
            'marks_obtained',
            'not_applicable',
        )
        read_only_fields = fields


class PlainUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'is_active',
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
            'not_applicable',
            'marks_obtained',
            'max_marks',
        )
        read_only_fields = fields

class ReportSectionDeSerializer(Serializer):
    audit_store = PrimaryKeyRelatedField(queryset=AuditStore.objects.all())
    section = PrimaryKeyRelatedField(queryset=Section.objects.all())
    pm_comment = CharField(max_length=2048, allow_blank=True)


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


class AuditFiatAssignDeSerializer(Serializer):
    audit = PrimaryKeyRelatedField(queryset=Audit.objects.all())
    email = EmailField()
    audit_date = DateField()

class ProfileInfoSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'first_name',
            'last_name',
            'gender',
            'marital_status',
            'education',
            'mobile_number',
            'date_of_birth',
            'address',
            'pincode',
            'city',
            'user_id',
            'is_complete'
        )
        read_only_fields = fields


