from django.conf import settings

from django.contrib.contenttypes.models import ContentType

from rest_framework import routers, viewsets
from rest_framework.serializers import Serializer, ModelSerializer, ValidationError, SlugRelatedField, PrimaryKeyRelatedField, DateField, RelatedField
from rest_framework.serializers import CharField, EmailField, BooleanField
from django.contrib.auth.models import User

from registration.models import Verification, GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR, GROUP_NAME_MODERATOR
from notifications.models import Notification

from questionnaire.models import Section, Question
from auditor.models import ProfileInfo, AuditApplication, BankInfo, AdditionalInfo
import auditor.serializers
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from client.models import Client, Store, ClientUser
from .models import City, Location
from answer.models import Answer, ReportSection
from attachment.models import Attachment
from payment.models import Payment

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
            'logo_url',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if self.context.get('id') is not None:
            client = Client.objects.get(id=self.context.get('id'))
        else:
            client = Client()
        client.name = self.validated_data.get('name', client.name)
        client.email = self.validated_data.get('email', client.email)
        client.phone = self.validated_data.get('phone', client.phone)
        client.logo_url = self.validated_data.get('logo_url', client.logo_url)
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

class LocationDeSerializer(ModelSerializer):
    class Meta:
        model = Location
        fields = (
            'id',
            'name',
            'pincode',
            'city',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if self.context.get('id') is not None:
            location = Location.objects.get(id=self.context.get('id'))
        else:
            location = Location()
        location.name = self.validated_data.get('name', location.name)
        location.pincode = self.validated_data.get('pincode', location.pincode)
        location.city = self.validated_data.get('city', location.city_id)
        return location


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
            'earnings_per_audit',
            'reimbursement',
            'description',
            'post_approval_description',
            'client',
            #'audit_count',
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
        return audit_cycle


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


class StoreDeSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'location',
            'client',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            store = Store.objects.get(id=self.context.get('id'))
        else:
            store = Store()
        store.name = self.validated_data.get('name', store.name)
        store.address = self.validated_data.get('address', store.address)
        store.location = self.validated_data.get('location', store.location_id)
        store.client = self.validated_data.get('client', store.client_id)
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
        )
        read_only_fields = fields


class UserSerializer(ModelSerializer):
    profileinfo = ProfileInfoSmallSerializer()
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'profileinfo',
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
        )
        read_only_fields = fields

class AuditSerializer(ModelSerializer):
    store = StoreSerializer()
    applications = AuditApplicationSerializer(many=True)
    audit_stores = AuditStoreSerializerWithoutAudit(many=True)
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'applications',
            'audit_stores',
            'post_approval_description',
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

class AuditDeSerializer(ModelSerializer):
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
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit = Audit.objects.get(id=self.context.get('id'))
        else:
            audit = Audit()
        audit.count = self.validated_data.get('count', audit.count)
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
    audit = AuditSerializerWithoutApplications()
    user = UserSerializer()
    visible_to = PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'visible_to',
        )
        read_only_fields = fields

class AuditStoreSerializerWithPayment(ModelSerializer):
    audit = AuditSerializerWithoutApplications()
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
            'payment'
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
                serializer = AuditSerializerWithoutApplications(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
            elif isinstance(value, AuditApplication):
                serializer = serializers.AuditApplicationSerializer(value)
            else:
                raise ValueError('Unexpected type of target object in notification: ', type(value))
            return serializer.data

    class NotificationActionObjectField(RelatedField):
        def to_representation(self, value):
            if isinstance(value, AuditApplication):
                serializer = AuditApplicationSerializer(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
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
            'is_complete'
        )
        read_only_fields = fields


class BankInfoSerializer(ModelSerializer):
    class Meta:
        model = BankInfo
        fields = (
            'id',
            'bank_name',
            'account_holder_name',
            'account_number',
            'ifsc_code',
            'pan_number',
            'user_id'
        )
        read_only_fields = fields


class AdditionalInfoSerializer(ModelSerializer):
    class Meta:
        model = AdditionalInfo
        fields = (
            'id',
            'has_car',
            'weekend_audit',
            'hair_color',
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

