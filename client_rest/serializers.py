from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User

from audit.models import Audit, AuditCycle, ReportAttribute, AuditCycleProofTagList
from audit_store.models import AuditStore, ReportActionPlan
from client.models import Client, Store, ClientUser
from manager.models import City, ProofTag

from questionnaire.models import Section, Question
from answer.models import Answer, ReportSection
from attachment.models import Attachment
from social.models import TwitterFeed, TwitterHandle
from questionnaire.models import QuestionnaireType

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
        )
        read_only_fields = ('id',)


class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
            'logo_url',
            'receive_email_notification'
        )
        read_only_fields = fields

class QuestionnaireTypeSerializer(ModelSerializer):
    class Meta:
        model = QuestionnaireType
        fields = (
            'id',
            'name',
            'is_default',
            'client_id',
        )
        read_only_fields = ('id',)

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
            'is_client_admin',
        )
        read_only_fields = fields

class AuditCycleSerializer(ModelSerializer):
    client = ClientSerializer()
    questionnaire_type = QuestionnaireTypeSerializer()
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'type',
            'start_date',
            'end_date',
            'client',
            'questionnaire_type',
        )
        read_only_fields = fields

class StoreSerializer(ModelSerializer):
    city = CitySerializer()
    client = ClientSerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'code',
            'type',
            'priority',
            'name',
            'address',
            'get_total_percentage',
            'get_store_rank',
            'city',
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
            'color',
            'attribute_data',
            'percentage'
        )
        read_only_fields = fields


class ReportActionPlanSerializer(ModelSerializer):
    class Meta:
        model = ReportActionPlan
        fields = (
            'id',
            'action_plan_description',
            'person_responsible',
            'created_by',
            'target_date',
            'status',
            'audit_store_id',
            'store_details'
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
            'answer_comment',
            'marks_obtained',
            'not_applicable',
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
            'marks_percentage',
            'color_code',
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

class TwitterHandleSerializer(ModelSerializer):
    class Meta:
        model = TwitterHandle
        fields = (
            'id',
            'client_id',
            'twitter_handle',
            'is_enabled',
        )
        read_only_fields = fields


class TwitterFeedSerializer(ModelSerializer):
    class Meta:
        model = TwitterFeed
        fields = (
            'id',
            'tweet_id',
            'tweet_text',
            'tweet_created_on',
            'sentiment_score',
            'sentiment_text'
        )
        read_only_fields = fields


class ReportAttributeSerializer(ModelSerializer):
    class Meta:
        model = ReportAttribute
        fields = (
            'id',
            'json_id',
            'label',
            'audit_cycle_id',
            'attribute_data',
        )
        read_only_fields = fields


class ProofTagSerializer(ModelSerializer):
    class Meta:
        model = ProofTag
        fields = (
            'id',
            'name',
            'description',
            'is_active'
        )


class AuditCycleProoftagListSerializer(ModelSerializer):
    proof_tag = ProofTagSerializer()
    class Meta:
        model = AuditCycleProofTagList
        fields = (
            'id',
            'is_active',
            'proof_tag'
        )
        read_only_fields = fields


class AuditCycleScoreSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'get_total_percentage'
        )
        read_only_fields = fields
