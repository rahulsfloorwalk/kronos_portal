from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from notifications.models import Notification
from rest_framework.serializers import CharField, EmailField, BooleanField
from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, DateField, RelatedField

from agency.models import AgencyUser, Agency
from answer.models import Answer, ReportSection
from attachment.models import Attachment
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from auditor.models import ProfileInfo, AuditApplication, BankInfo, AdditionalInfo, Preferences
from client.models import Client, Store, ClientUser
from payment.models import Payment
from questionnaire.models import Section, Question
from registration.models import MobileNumber, Verification
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR, GROUP_NAME_MODERATOR, GROUP_NAME_AGENCY
from social.models import Facebook
from referral.models import AuditorReferral
from .models import City
from notify.models import OpportunityEmailRecord
from manager.viewss.questionnaire_type import QuestionnaireTypeSerializer

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'brand_name',
            'email',
            'phone',
            'logo_url',
            'brand_logo_url',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if self.context.get('id') is not None:
            client = Client.objects.get(id=self.context.get('id'))
        else:
            client = Client()
        client.name = self.validated_data.get('name', client.name)
        client.brand_name = self.validated_data.get('brand_name', client.brand_name)
        client.email = self.validated_data.get('email', client.email)
        client.phone = self.validated_data.get('phone', client.phone)
        client.logo_url = self.validated_data.get('logo_url', client.logo_url)
        client.brand_logo_url = self.validated_data.get('brand_logo_url', client.brand_logo_url)
        return client

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
    questionnaire_type = QuestionnaireTypeSerializer()
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'type',
            'status',
            'start_date',
            'end_date',
            'earnings_per_audit',
            'reimbursement',
            'description',
            'post_approval_description',
            'client',
            'audit_count',
            'questionnaire_type',
        )
        read_only_fields = fields


class AuditCycleDeSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'type',
            'status',
            'start_date',
            'end_date',
            'earnings_per_audit',
            'reimbursement',
            'description',
            'client',
            'questionnaire_type',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit_cycle = AuditCycle.objects.get(id=self.context.get('id'))
        else:
            audit_cycle = AuditCycle()
        audit_cycle.name = self.validated_data.get('name', audit_cycle.name)
        audit_cycle.type = self.validated_data.get('type', audit_cycle.type)
        audit_cycle.status = self.validated_data.get('status', audit_cycle.status)
        audit_cycle.start_date = self.validated_data.get('start_date', audit_cycle.start_date)
        audit_cycle.end_date = self.validated_data.get('end_date', audit_cycle.end_date)
        audit_cycle.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit_cycle.earnings_per_audit)
        audit_cycle.reimbursement = self.validated_data.get('reimbursement', audit_cycle.reimbursement)
        audit_cycle.description = self.validated_data.get('description', audit_cycle.description)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        return audit_cycle


class StoreSerializer(ModelSerializer):
    client = ClientSerializer()
    city = CitySerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'client',
            'client_id',
            'code',
            'type',
            'priority',
            'phone',
            'city',
        )
        read_only_fields = fields


class StoreSerializerWithoutClientUserAndClient(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'code',
            'type',
            'priority',
            'phone',
            'city',
            'client_id',
            'city_id',
        )
        read_only_fields = fields


class StoreDeSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'client',
            'code',
            'type',
            'phone',
            'priority',
            'city',
        )
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            store = Store.objects.get(id=self.context.get('id'))
        else:
            store = Store()
        store.name = self.validated_data.get('name', store.name)
        store.address = self.validated_data.get('address', store.address)
        store.city = self.validated_data.get('city', store.city_id)
        store.client = self.validated_data.get('client', store.client_id)
        store.code = self.validated_data.get('code', store.code)
        store.type = self.validated_data.get('type', store.type)
        store.priority = self.validated_data.get('priority', store.priority)
        store.phone = self.validated_data.get('phone', store.phone)
        return store


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


class AgencySerializer(ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            'id',
            'name',
            'formed_in_year',
            'gstin',
            'cin',
            'agreement_accepted',
            'strength',
            'account_holder_name',
            'account_number',
            'ifsc_code',
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


class AuditApplicationSerializer(ModelSerializer):
    profileinfo = ProfileInfoSmallSerializer()
    class Meta:
        model = AuditApplication
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'profileinfo',
            'avg_qa_rating',
            'report_exists'
        )
        read_only_fields = fields


class AuditSerializer(ModelSerializer):
    store = StoreSerializer()
    audit_cycle = AuditCycleSerializer()
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'audit_date',
            'hidden',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'post_approval_description',
            'application_count',
            'report_count',
            'valid_report_count',
        )
        read_only_fields = fields

class AuditDeSerializer(ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'audit_date',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'post_approval_description',
        )
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit = Audit.objects.get(id=self.context.get('id'))
        else:
            audit = Audit()
        audit.count = self.validated_data.get('count', audit.count)
        audit.audit_date = self.validated_data.get('audit_date', audit.audit_date)
        audit.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit.earnings_per_audit)
        audit.reimbursement = self.validated_data.get('reimbursement', audit.reimbursement)
        audit.store = self.validated_data.get('store', audit.store_id)
        audit.audit_cycle = self.validated_data.get('audit_cycle', audit.audit_cycle_id)
        audit.post_approval_description = self.validated_data.get('post_approval_description', audit.post_approval_description)
        return audit

class PaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'comment',
            'amount',
            'status',
            'user_id',
            'audit_store_id',
            'added_on',
            'paid_on',
        )
        read_only_fields = fields

class PlainUserSerializer(ModelSerializer):
    mobile_numbers = MobileNumberSerializer(many=True)
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'is_active',
            'mobile_numbers',
        )
        read_only_fields = fields

class AgencyUserInfoSerializer(ModelSerializer):
    agency = AgencySerializer()
    user = PlainUserSerializer()

    class Meta:
        model = AgencyUser
        fields = (
            'id',
            'full_name',
            'agency',
            'user',
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
            'is_active',
            'mobile_numbers',
            'profileinfo',
            'agencyuser',
        )
        read_only_fields = fields

class PaymentUserSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Payment
        fields = (
            'id',
            'comment',
            'amount',
            'status',
            'user',
            'audit_store_id',
            'added_on',
            'paid_on',
        )
        read_only_fields = fields

class AuditStoreSerializer(ModelSerializer):
    audit = AuditSerializer()
    user = UserSerializer()
    visible_to = PrimaryKeyRelatedField(many=True, read_only=True)
    assigned_to_moderator = PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'visible_to',
            'assigned_to_moderator',
            'qa_rating',
            'earnings_per_audit',
            'reimbursement',
            'attribute_data',
        )
        read_only_fields = fields

class ClientUserSerializer(ModelSerializer):
    user = PlainUserSerializer()
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

class ClientUserDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    full_name = CharField(max_length=50)
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    is_client_admin = BooleanField()

class AuditStoreSerializerWithoutAudit(ModelSerializer):
    user = UserSerializer()
    assigned_to_moderator = PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'qa_rating',
            'assigned_to_moderator',
            'attribute_data',
        )
        read_only_fields = fields

class AuditStoreSerializerWithPayment(ModelSerializer):
    audit = AuditSerializer()
    user = UserSerializer()
    payment = PaymentSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'payment',
            'qa_rating',
        )
        read_only_fields = fields

class AuditStoreDeSerializer(ModelSerializer):
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
        )
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit_store = AuditStore.objects.get(id=self.context.get('id'))
        else:
            audit_store = AuditStore()
        audit_store.status = self.validated_data.get('status', audit_store.status)
        audit_store.audit_date = self.validated_data.get('audit_date', audit_store.audit_date)
        audit_store.audit = self.validated_data.get('audit', audit_store.audit_id)
        audit_store.user = self.validated_data.get('user', audit_store.user_id)
        return audit_store


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
            'question_type',
            'question_data',
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
        question.question_type = self.validated_data.get('question_type', question.question_type)
        question.question_data = self.validated_data.get('question_data', question.question_data)
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

class ContentTypeSerializer(ModelSerializer):
    class Meta:
        model = ContentType
        fields = ('app_label','model')
        read_only_fields = fields


class NotificationSerializer(ModelSerializer):
    class NotificationTargetField(RelatedField):
        def to_representation(self, value):
            if isinstance(value, Audit):
                serializer = AuditSerializer(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
            elif isinstance(value, AuditApplication):
                serializer = AuditApplicationSerializer(value)
            else:
                raise ValueError('Unexpected type of target object in notification: ', type(value))
            return serializer.data

    class NotificationActionObjectField(RelatedField):
        def to_representation(self, value):
            if isinstance(value, AuditApplication):
                serializer = AuditApplicationSerializer(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
            elif isinstance(value, Payment):
                serializer = PaymentSerializer(value)
            else:
                raise ValueError('Unexpected type of action object in notification: ', type(value))
            return serializer.data

    class NotificationActorField(RelatedField):
        def to_representation(self, value):
            if value.groups.filter(name=GROUP_NAME_MANAGER).exists():
                serializer = PlainUserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_AUDITOR).exists():
                serializer = UserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_MODERATOR).exists():
                serializer = PlainUserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_AGENCY).exists():
                serializer = UserSerializer(value)
            else:
                raise ValueError("Cannot serialize user with unknown user groups:{}".format(value.groups.all()))
            return serializer.data

    actor = NotificationActorField(read_only=True)
    actor_content_type = ContentTypeSerializer()

    target = NotificationTargetField(read_only=True)
    target_content_type = ContentTypeSerializer()

    action_object = NotificationActionObjectField(read_only=True)
    action_object_content_type = ContentTypeSerializer()

    class Meta:
        model = Notification
        fields = (
            'id',
            'unread',
            'timestamp',
            'level',
            'verb',
            'description',
            'recipient',

            'actor',
            'actor_content_type',

            'target',
            'target_content_type',

            'action_object',
            'action_object_content_type',
        )
        read_only_fields = fields


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
            'is_complete',
            'average_rating',
        )
        read_only_fields = fields


class BankInfoSerializer(ModelSerializer):
    class Meta:
        model = BankInfo
        fields = (
            'id',
            'bank_name',
            'bank_name_from_ifsc',
            'account_holder_name',
            'account_number',
            'ifsc_code',
            'pan_number',
            'user_id',
            'is_complete',
            'is_valid',
        )
        read_only_fields = fields


class AdditionalInfoSerializer(ModelSerializer):
    class Meta:
        model = AdditionalInfo
        fields = (
            'id',
            'has_car',
            'car_cost',
            'car_model',
            'has_car',
            'weekend_audit',
            'hair_color',
            'industry',
            'company',
            'height',
            'weight',
            'distance',
            'camera_owned',
            'camera_resoulution',
            'laptop_owned',
            'smart_phone_owned',
            'weekend_audit',
            'user_id',
            'occupation',
            'referral_code',
            'referred_by',
            'laptop_model',
            'mobile_model',
            'is_complete',
        )
        read_only_fields = fields

class FacebookSerializer(ModelSerializer):
    class Meta:
        model = Facebook
        fields = (
            'id',
            'facebook_id',
            'profile_data',
            'is_verified',
            'user_id',
        )
        read_only_fields = fields

class VerificationSerializer(ModelSerializer):
    class Meta:
        model = Verification
        fields = (
            'id',
            'key_expires',
            'is_verified',
            'user_id'
        )
        read_only_fields = fields


class AuditorSerializer(ModelSerializer):
    profileinfo = ProfileInfoSerializer()
    verification = VerificationSerializer()
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'is_active',
            'date_joined',
            'last_login',
            'profileinfo',
            'verification',
        )
        read_only_fields = fields


class ModeratorDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()


class ManagerDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()


class AuditorReferralSerializer(ModelSerializer):
    class Meta:
        model = AuditorReferral
        fields = (
            'id',
            'type',
            'comment',
            'referred_by',
            'referred_to',
            'amount',
            'added_on'
        )
        read_only_fields = fields

class PreferencesSerializer(ModelSerializer):
    class Meta:
        model = Preferences
        fields = (
            'id',
            'receive_new_opportunities_email',
            'receive_transactional_email',
            'receive_new_opportunities_sms',
            'receive_transactional_sms',
            'pp_accepted',
            'agreement_accepted',
            'user_id',
        )
        read_only_fields = fields

class OpportunityEmailRecordSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = OpportunityEmailRecord
        fields = (
            'id',
            'audit_cycle_id',
            'city',
            'total_count',
            'progress_count',
            'created_at',
            'modified_at',
        )
        read_only_fields = fields
