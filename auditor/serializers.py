from datetime import datetime
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from rest_framework.serializers import ModelSerializer, ValidationError, Serializer, PrimaryKeyRelatedField, CharField, RelatedField, IntegerField
from rest_framework import serializers

from notifications.models import Notification

from registration.models import GROUP_NAME_AUDITOR

from manager.models import Location, City
from audit.models import Audit, AuditCycle
from client.models import Client, Store
from audit_store.models import AuditStore
from .models import ProfileInfo, AdditionalInfo, BankInfo, AuditApplication
from questionnaire.models import Section, Question
from answer.models import Answer, ReportSection
from attachment.models import Attachment
from payment.models import Payment
from referral.models import AuditorReferral
from social.models import Facebook
from auditor.models import Preferences

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
            'city_id',
            'user_id',
            'is_complete'
        )
        read_only_fields = fields


class ProfileInfoDeSerializer(ModelSerializer):
    city_id = PrimaryKeyRelatedField(queryset=City.objects.all(), required=False, allow_null=True)
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'first_name',
            'last_name',
            'gender',
            'marital_status',
            'education',
            'date_of_birth',
            'address',
            'pincode',
            'city_id',
            'user_id',
        )
        read_only_fields = ('id', 'user_id')

    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            profile_info = ProfileInfo.objects.get(user_id=self.context['current_user'].id)
        except ProfileInfo.DoesNotExist:
            profile_info = ProfileInfo()
            profile_info.user_id = self.context['current_user'].id

        profile_info.first_name = self.validated_data.get('first_name', profile_info.first_name)
        profile_info.last_name = self.validated_data.get('last_name', profile_info.last_name)
        profile_info.gender = self.validated_data.get('gender', profile_info.gender)
        profile_info.marital_status = self.validated_data.get('marital_status', profile_info.marital_status)
        profile_info.education = self.validated_data.get('education', profile_info.education)
        profile_info.date_of_birth = self.validated_data.get('date_of_birth', profile_info.date_of_birth)
        profile_info.address = self.validated_data.get('address', profile_info.address)
        profile_info.pincode = self.validated_data.get('pincode', profile_info.pincode)
        profile_info.city = self.validated_data.get('city_id', profile_info.city)

        #profile_info.save()
        return profile_info



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
            'mspa_code',
            'company',
            'industry',
            'car_cost',
            'car_model',
            'laptop_model',
            'mobile_model',
            'referral_code',
            'is_complete'
        )
        read_only_fields = fields

class AdditionalInfoDeSerializer(ModelSerializer):
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
            'mspa_code',
            'company',
            'industry',
            'car_cost',
            'car_model',
            'laptop_model',
            'mobile_model',
        )
        read_only_fields = ('id', 'user_id', )

    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            additional_info = AdditionalInfo.objects.get(user_id=self.context.get('current_user').id)
        except AdditionalInfo.DoesNotExist:
            additional_info = AdditionalInfo()
            additional_info.user_id = self.context.get('current_user').id

        additional_info.has_car = self.validated_data.get('has_car', additional_info.has_car)
        additional_info.weekend_audit = self.validated_data.get('weekend_audit', additional_info.weekend_audit)
        additional_info.hair_color = self.validated_data.get('hair_color', additional_info.hair_color)
        additional_info.height = self.validated_data.get('height', additional_info.height)
        additional_info.weight = self.validated_data.get('weight', additional_info.weight)
        additional_info.distance = self.validated_data.get('distance', additional_info.distance)
        additional_info.camera_owned = self.validated_data.get('camera_owned', additional_info.camera_owned)
        additional_info.camera_resoulution = self.validated_data.get('camera_resoulution', additional_info.camera_resoulution)
        additional_info.laptop_owned = self.validated_data.get('laptop_owned', additional_info.laptop_owned)
        additional_info.smart_phone_owned = self.validated_data.get('smart_phone_owned', additional_info.smart_phone_owned)
        additional_info.occupation = self.validated_data.get('occupation', additional_info.occupation)
        additional_info.mspa_code = self.validated_data.get('mspa_code', additional_info.mspa_code)
        additional_info.company = self.validated_data.get('company', additional_info.company)
        additional_info.industry = self.validated_data.get('industry', additional_info.industry)
        additional_info.car_cost = self.validated_data.get('car_cost', additional_info.car_cost)
        additional_info.car_model = self.validated_data.get('car_model', additional_info.car_model)
        additional_info.laptop_model = self.validated_data.get('laptop_model', additional_info.laptop_model)
        additional_info.mobile_model = self.validated_data.get('mobile_model', additional_info.mobile_model)

        return additional_info


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
            'user_id',
            'is_complete'
        )
        read_only_fields = ('id', 'user_id')

    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            bank_info = BankInfo.objects.get(user_id=self.context.get('current_user').id)
        except BankInfo.DoesNotExist:
            bank_info = BankInfo()
            bank_info.user_id = self.context.get('current_user').id

        bank_info.bank_name = self.validated_data.get('bank_name', bank_info.bank_name)
        bank_info.account_holder_name = self.validated_data.get('account_holder_name', bank_info.account_holder_name)
        bank_info.account_number = self.validated_data.get('account_number', bank_info.account_number)
        bank_info.ifsc_code = self.validated_data.get('ifsc_code', bank_info.ifsc_code)
        bank_info.pan_number = self.validated_data.get('pan_number', bank_info.pan_number)

        return bank_info


class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'name',
            'logo_url',
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
    location = LocationSerializer()
    class Meta:
        model = Store
        fields = (
            'name',
            'address',
            'location',
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


class AuditorSerializer(ModelSerializer):
    profileinfo = ProfileInfoSerializer()
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'is_active',
            'date_joined',
            'last_login',
            'profileinfo'
        )
        read_only_fields = fields

class AuditApplicationSerializer(ModelSerializer):
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


class AuditApplicationApplyDeSerializer(Serializer):
    audit_id = serializers.PrimaryKeyRelatedField(queryset=Audit.objects.filter(audit_cycle__status__in=[AuditCycle.ACTIVE,AuditCycle.UPCOMING]))
    profileinfo_id = serializers.PrimaryKeyRelatedField(queryset=ProfileInfo.objects.all())
    audit_date = serializers.DateField()

    def validate(self, attrs):
        audit = attrs["audit_id"]
        audit_date = attrs["audit_date"]
        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise ValidationError({"non_field_errors": ["preferred audit date is not within range"]})
        return attrs


class AuditApplicationCancelDeSerializer(Serializer):
    audit_id = serializers.PrimaryKeyRelatedField(queryset=Audit.objects.filter(audit_cycle__status__in=[AuditCycle.ACTIVE,AuditCycle.UPCOMING]))
    profileinfo_id = serializers.PrimaryKeyRelatedField(queryset=ProfileInfo.objects.all())


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

class AnswerDeSerializer(ModelSerializer):
    class Meta:
        model = Answer
        fields = (
            'question',
            'audit_store',
            'answer_text'
        )
        validators=[]

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
            'section',
            'auditor_comment'
        )
        read_only_fields = fields

class ReportSectionDeSerializer(Serializer):
    audit_store = serializers.PrimaryKeyRelatedField(queryset=AuditStore.objects.all())
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())
    auditor_comment = CharField(max_length=2048, allow_blank=True)


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


class AttachmentDeSerializer(Serializer):
    file_name = CharField()
    file_size = IntegerField()
    file_type = CharField()


class UserSerializer(ModelSerializer):
    profileinfo = ProfileInfoSerializer()
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'profileinfo'
        )
        read_only_fields = fields

class PlainUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'date_joined',
            'last_login',
        )
        read_only_fields = fields

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
            if value.groups.filter(name=GROUP_NAME_AUDITOR).exists():
                serializer = UserSerializer(value)
                return serializer.data
            else:
                return None

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

class FacebookDeSerializer(ModelSerializer):
    class Meta:
        model = Facebook
        fields = (
            'id',
            'facebook_id',
            'access_token',
            'profile_data',
            'is_verified',
            'user_id',
        )
        read_only_fields = ('id', 'user_id')

    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            facebook = Facebook.objects.get(user_id=self.context.get('current_user').id)
        except Facebook.DoesNotExist:
            facebook = Facebook()
            facebook.user_id = self.context.get('current_user').id

        facebook.facebook_id = self.validated_data.get('facebook_id', facebook.facebook_id)
        facebook.access_token = self.validated_data.get('access_token', facebook.access_token)
        facebook.profile_data = self.validated_data.get('profile_data', facebook.profile_data)
        facebook.is_verified = self.validated_data.get('is_verified', facebook.is_verified)

        return facebook

class ReferralSerializer(ModelSerializer):
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
            'user_id',
        )
        read_only_fields = ('id', 'user_id')

    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            preferences = Preferences.objects.get(user_id=self.context.get('current_user').id)
        except Preferences.DoesNotExist:
            preferences = Preferences()
            preferences.user_id = self.context.get('current_user').id

        preferences.receive_new_opportunities_email = self.validated_data.get('receive_new_opportunities_email', preferences.receive_new_opportunities_email)

        return preferences
