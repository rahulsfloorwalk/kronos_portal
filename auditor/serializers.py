from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from rest_framework.serializers import ModelSerializer, ValidationError, Serializer, PrimaryKeyRelatedField, CharField, RelatedField, IntegerField, SerializerMethodField
from rest_framework import serializers

from notifications.models import Notification

from registration.models import GROUP_NAME_AUDITOR
from django.utils import timezone

from manager.models import City, ProofTag
from audit.models import Audit, AuditCycle, AuditCycleProofTagList
from client.models import Client, Store
from audit_store.models import AuditStore,ReportFeedbackByAuditor
from .models import ProfileInfo, AdditionalInfo, BankInfo, AuditApplication
from questionnaire.models import Section, Question
from answer.models import Answer, ReportSection
from attachment.models import Attachment
from payment.models import Payment
from referral.models import AuditorReferral
from social.models import Facebook
from auditor.models import Preferences
from agency.models import Agency
# from kronos.utils import validate_ifsc, validate_pan
from kronos.utils import find_payment_due_date, get_difference_between_date
from client.service.client_manager import get_manager_info_list_by_audit_store_obj
from auditor.service.auditor_api import get_report_completion_percentage
from manager.models import AuditProoftagNotAvailable

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
            'country',
            'lat',
            'lon',
        )
        read_only_fields = fields

class DashBoardCitySerializer(ModelSerializer):
    country_name = SerializerMethodField()

    def get_country_name(self, obj):
        return obj.country_name()
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
            'country',
            'country_name',
            'lat',
            'lon',
        )
        read_only_fields = fields

class ProfileInfoSerializer(ModelSerializer):
    city = DashBoardCitySerializer()
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'pronouns',
            'first_name',
            'last_name',
            'gender',
            'marital_status',
            'education',
            'dial_code',
            'whatsapp_dial_code',
            'mobile_number',
            'whatsapp_number',
            'date_of_birth',
            'address',
            'pincode',
            'city',
            'city_id',
            'user_id',
            'is_complete',
            'certification_score'
        )
        read_only_fields = fields


class ProfileInfoDeSerializer(ModelSerializer):
    city_id = PrimaryKeyRelatedField(queryset=City.objects.all(), required=False, allow_null=True)
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'pronouns',
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

        profile_info.pronouns = self.validated_data.get('pronouns', profile_info.pronouns)
        profile_info.first_name = self.validated_data.get('first_name', profile_info.first_name)
        profile_info.last_name = self.validated_data.get('last_name', profile_info.last_name)
        profile_info.gender = self.validated_data.get('gender', profile_info.gender)
        profile_info.marital_status = self.validated_data.get('marital_status', profile_info.marital_status)
        profile_info.education = self.validated_data.get('education', profile_info.education)
        profile_info.date_of_birth = self.validated_data.get('date_of_birth', profile_info.date_of_birth)
        profile_info.address = self.validated_data.get('address', profile_info.address)
        profile_info.pincode = self.validated_data.get('pincode', profile_info.pincode)
        profile_info.city = self.validated_data.get('city_id', profile_info.city)

        # profile_info.save()
        return profile_info
    
class ReportFeedbackByAuditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFeedbackByAuditor
        fields = ('audit_understanding', 'coordination', 'portal_accessibility')

class ReportFeedbackByAuditorDeserializer(serializers.Serializer):
    audit_understanding = serializers.CharField(max_length=4096)
    coordination = serializers.CharField(max_length=4096)
    portal_accessibility = serializers.CharField(max_length=4096)

    def deserialize(self):
        current_user = self.context.get('current_user')
        audit_store_id = self.context.get('audit_store_id')

        if current_user is None:
            raise TypeError("missing keyword argument 'current_user'")
        if audit_store_id is None:
            raise TypeError("missing keyword argument 'audit_store_id'")

        try:
            report_feedback = ReportFeedbackByAuditor.objects.get(user=current_user, audit_store_id=audit_store_id)
        except ReportFeedbackByAuditor.DoesNotExist:
            report_feedback = ReportFeedbackByAuditor(user=current_user, audit_store_id=audit_store_id)
        
        report_feedback.audit_understanding = self.validated_data.get('audit_understanding', report_feedback.audit_understanding)
        report_feedback.coordination = self.validated_data.get('coordination', report_feedback.coordination)
        report_feedback.portal_accessibility = self.validated_data.get('portal_accessibility', report_feedback.portal_accessibility)
        
        # Set created_at field automatically if it's not set yet
        if not report_feedback.created_at:
            report_feedback.created_at = timezone.now()
        
        return report_feedback
    
    
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
            'is_complete',
            'income',
            'is_tour_complete',
            'interest_area',
            'language_known'
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
            'income',
            'is_tour_complete',
            'interest_area',
            'language_known'
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
        additional_info.income = self.validated_data.get('income', additional_info.income)
        additional_info.is_tour_complete = self.validated_data.get('is_tour_complete', additional_info.is_tour_complete)
        additional_info.interest_area = self.validated_data.get('interest_area', additional_info.interest_area)
        additional_info.language_known = self.validated_data.get('language_known', additional_info.language_known)
        
        return additional_info


class BankInfoSerializer(ModelSerializer):
    class Meta:
        model = BankInfo
        fields = (
            'id',
            # 'bank_name',
            'bank_name_from_ifsc',
            'account_holder_name',
            'account_number',
            'ifsc_code',
            'pan_number',
            'user_id',
            'is_valid',
            'is_pan_card_valid',
          #  'is_ifsc_code_valid',
            'is_complete',
            'paypal'
        )
        read_only_fields = ('id', 'user_id')

    def validate_pan_number(self, value):
        # if value and not validate_pan(value):
            # raise ValidationError("Please provider a valid PAN number")
        # for now we're just converting the given string to uppercase
        return str.upper(value)

    def validate_ifsc_code(self, value):
        # if value and not validate_ifsc(value):
            # raise ValidationError("Please provide a valid IFSC code")
        # for now we're just converting the given string to uppercase
        return str.upper(value)

    def validate_account_holder_name(self, value):
        # for now we're just converting the given string to uppercase
        return str.upper(value)

    def validate_account_number(self, value):
        # for now we're just converting the given string to uppercase
        return str.upper(value)

    def validate(self, data):
        account_number = data.get('account_number', None)
        ifsc_code = data.get('ifsc_code', None)
        paypal = data.get('paypal')

        if account_number and ifsc_code and paypal is None:
            profile_info = ProfileInfo.objects.get(user=self.context.get('current_user'))
            if profile_info.city is not None and profile_info.city.country is not None and profile_info.city.country != "IN":
                    return data
        
        # if account_number and ifsc_code:
        #     if self.context.get('current_user') is None:
        #         raise TypeError("missing keyword argument 'current_user'")

            user_id = self.context.get('current_user').id
            exists = BankInfo.objects.filter(account_number = account_number, ifsc_code = ifsc_code).exclude(user_id = user_id).exists()
            exists1 = Agency.objects.filter(account_number = account_number, ifsc_code = ifsc_code).exists()
            if exists or exists1:
                raise ValidationError('Bank account details already exists')
        return data


    def deserialize(self,user):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            bank_info = BankInfo.objects.get(user_id=self.context.get('current_user').id)
        except BankInfo.DoesNotExist:
            bank_info = BankInfo()
            bank_info.user_id = self.context.get('current_user').id

        # bank_info.account_holder_name = self.validated_data.get('account_holder_name', bank_info.account_holder_name)
        # bank_info.account_number = self.validated_data.get('account_number', bank_info.account_number)
        # bank_info.ifsc_code = self.validated_data.get('ifsc_code', bank_info.ifsc_code)
        # bank_info.pan_number = self.validated_data.get('pan_number', bank_info.pan_number)
        # bank_info.paypal = self.validated_data.get('pan_number', bank_info.paypal)

        # return bank_info

        profile_info = ProfileInfo.objects.get(user=user)
        if profile_info.city is not None and profile_info.city.country != "IN":
            if not bank_info.account_number:
                bank_info.account_holder_name = 'John Doe'
                bank_info.account_number = '1234567890'
                bank_info.ifsc_code = 'ABCDE1234F'
                bank_info.pan_number = 'ABCFG1234H'
                # bank_info.paypal = self.validated_data.get('paypal', bank_info.paypal)
        else:
            bank_info.account_holder_name = self.validated_data.get('account_holder_name', bank_info.account_holder_name)
            bank_info.account_number = self.validated_data.get('account_number', bank_info.account_number)
            bank_info.ifsc_code = self.validated_data.get('ifsc_code', bank_info.ifsc_code)
            bank_info.pan_number = self.validated_data.get('pan_number', bank_info.pan_number)

        bank_info.paypal = self.validated_data.get('paypal', bank_info.paypal)
        bank_info.save()
        return bank_info


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
            'eligibility',
            'post_approval_description',
            'audit_alignment_factors',
            'client',
            'support_page_link',
            'audit_report_summary'

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

class AppliedAuditSerializer(ModelSerializer):
    audit = AuditSerializer()
    audit_store = serializers.SerializerMethodField()
    def get_audit_store(self, obj):
        audit_store = obj.audit.audit_stores.filter( user_id=obj.profileinfo.user.id).order_by('-id').first()
        if audit_store:
            return {
                "id": audit_store.id,
                "status": audit_store.status
            }
        return None
    class Meta:
        model= AuditApplication
        fields=(
            'id',
            'audit_date',
            'status',
            'get_brand_name',
            'profileinfo',
            'audit_store',
            'audit'
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
    audit_store = serializers.SerializerMethodField()
    def get_audit_store(self, obj):
        # audit_stores = obj.audit.audit_stores.filter(status="ASSIGNED")
        # audit_store = obj.audit.audit_stores.filter(status__in=['ACKNOWLEDGED', 'ASSIGNED']).first()
        audit_store = obj.audit.audit_stores.filter( user_id=obj.profileinfo.user.id, status__in=['ACKNOWLEDGED', 'ASSIGNED'] ).first()

        return audit_store.id if audit_store else None
    
    class Meta:
        model = AuditApplication
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'profileinfo',
            'audit_store'    
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
    get_date_diff = SerializerMethodField('get_date_difference')
    completion_percentage = SerializerMethodField()

    def get_date_difference(self, audit_store_obj):
        return get_difference_between_date(audit_store_obj.audit_date)
    
    def get_completion_percentage(self, audit_store_obj):
        # Call the get_report_completion_percentage function to fetch completion percentage for the audit store
        completion_percentage = get_report_completion_percentage(audit_store_obj.id)
        return completion_percentage
    
    # manager_email_list = SerializerMethodField()
    # def get_manager_email_list(self, audit_store_obj):
    #     return get_manager_email_list_by_audit_store_obj(audit_store_obj)
    
    manager_info_list = SerializerMethodField()
    def get_manager_info_list(self, audit_store_obj):
        manager_info = get_manager_info_list_by_audit_store_obj(audit_store_obj)
        return [{'name': info.get('name', ''), 'mobile': info.get('mobile', '')} for info in manager_info]
    
    audit = AuditSerializer()
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'earnings_per_audit',
            'reimbursement',
            'audit_date',
            'audit',
            'report_summary',
            'nps_section',
            'user',
            'get_date_diff',
            'max_attachment_limit',
            # 'manager_email_list',            
            'manager_info_list',
            'report_revert_count',
            'completion_percentage'
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
            'hide_question',
            'optional_comment_required',
            'max_marks'
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
            'minimum_attachment_count',
            'questions',
            'hide_comment'
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

class AnswerSerializer(serializers.ModelSerializer):
    # section_completion_status = SerializerMethodField()
    question_data = serializers.JSONField(source='question.question_data', read_only=True)
    max_marks = serializers.IntegerField(source='question.max_marks',read_only=True)

    # def get_section_completion_status(self, answer_obj):
    #     # Call the get_report_completion_percentage function to fetch completion percentage for the audit store
    #     section_completion_status = get_section_completion_status(answer_obj.audit_store_id,answer_obj.question_id)
    #     return section_completion_status
    class Meta:
        model = Answer
        fields = (
            'id',
            'question_id',
            'audit_store_id',
            'revert_message',
            'answer_text',
            'answer_comment',
            'get_answer_text_list',
            'max_marks',
            'question_data',
            # 'section_completion_status'
        )
        read_only_fields = fields

class ReportSectionSerializer(ModelSerializer):
    # section_completion_status = SerializerMethodField()
    
    # def get_section_completion_status(self, report_section_obj):
    #     # Call the get_section_completion_percentage function to fetch completion percentage for the audit store
    #     section_completion_status = get_section_completion_status(report_section_obj.audit_store_id, report_section_obj.section.id)
    #     return section_completion_status
    
    class Meta:
        model = ReportSection
        fields = (
            'id',
            'audit_store',
            'section',
            'revert_message',
            'auditor_comment',
            # 'section_completion_status'
        )
        read_only_fields = fields

class ReportSectionDeSerializer(Serializer):
    audit_store = serializers.PrimaryKeyRelatedField(queryset=AuditStore.objects.all())
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())
    auditor_comment = CharField(max_length=4096, allow_blank=True)


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
            'proof_tag',
        )
        read_only_fields = fields


class AuditProoftagSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), default=serializers.CurrentUserDefault())
    class Meta:
        model = AuditProoftagNotAvailable
        fields = '__all__'


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
            elif isinstance(value, Payment):
                serializer = PaymentSerializer(value)
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
    payment_due_date = SerializerMethodField()
    reimbursement = SerializerMethodField()
    amount = SerializerMethodField()

    # def get_payment_due_date(self, payment_obj):
        # return find_payment_due_date(payment_obj.audit_store.audit_date)
    
    def get_payment_due_date(self, payment_obj):
        if isinstance(payment_obj, Payment):
            audit_store = payment_obj.audit_store
            if audit_store:
                audit_date = audit_store.audit_date
                if audit_date:
                    return find_payment_due_date(audit_date)
        return None

    # def get_reimbursement(self,payment_obj):
    #     if isinstance(payment_obj, Payment):
    #         return payment_obj.audit_store.reimbursement if payment_obj.audit_store else None
    #     return None
    
    def get_reimbursement(self, payment_obj):
        if isinstance(payment_obj, Payment):
            if payment_obj.audit_store:
                reimbursement = payment_obj.audit_store.reimbursement
                if not reimbursement and payment_obj.audit_store.audit:
                    reimbursement = payment_obj.audit_store.audit.reimbursement
                return reimbursement
        return None
    
    def get_amount(self, payment_obj):
        if isinstance(payment_obj, Payment):
            if payment_obj.audit_store:
                earnings_per_audit = payment_obj.audit_store.earnings_per_audit
                if not earnings_per_audit and payment_obj.audit_store.audit:
                    earnings_per_audit = payment_obj.audit_store.audit.earnings_per_audit
                return earnings_per_audit
        return None
    # def get_reimbursement(self,payment_obj):
    #     return payment_obj.audit_store.reimbursement

    class Meta:
        model = Payment
        fields = (
            'id',
            'comment',
            # 'amount',
            'status',
            'user_id',
            'audit_store_id',
            'added_on',
            'paid_on',
            'get_audit_details',
            'payment_due_date',
            'reimbursement',
            'amount'
            # 'earnings_per_audit'
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
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    class Meta:
        model = Preferences
        fields = (
            'id',
            'receive_new_opportunities_email',
            'receive_new_opportunities_sms',
            'receive_transactional_whatsapp_message',
            'is_active',
            'user_id',
            'pp_accepted',
            'agreement_accepted',
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
        preferences.receive_new_opportunities_sms = self.validated_data.get('receive_new_opportunities_sms', preferences.receive_new_opportunities_sms)
        preferences.receive_transactional_whatsapp_message = self.validated_data.get('receive_transactional_whatsapp_message', preferences.receive_transactional_whatsapp_message)

        return preferences  


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


class UserAPISerializer(ModelSerializer):
    profileinfo = ProfileInfoSerializer()
    bankinfo = BankInfoSerializer()
    facebook = FacebookSerializer()
    additionalinfo = AdditionalInfoSerializer()
    preferences = PreferencesSerializer()
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'profileinfo',
            'bankinfo',
            'facebook',
            'additionalinfo',
            'preferences'
        )
        read_only_fields = fields
    
class PronounsSerializer(serializers.Serializer):
    HE_HIM = "hh"
    SHE_HER = "sh"
    THEY_THEM = "tt"
    HE_THEY = "ht"
    SHE_THEY = "st"
    PRONOUNS = (
        (HE_HIM, "He/Him"),
        (SHE_HER, "She/Her"),
        (THEY_THEM, "They/Them"),
        (HE_THEY, "He/They"),
        (SHE_THEY, "She/They")
    )

    pronouns = serializers.ChoiceField(choices=PRONOUNS, allow_blank=True, required=False)

class GenderSerializer(serializers.Serializer):
    MALE = 'M'
    FEMALE = 'F'
    TRANS = 'T'
    NON_BINARY = 'N'
    
    GENDER = (
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (TRANS, 'Trans person'),
        (NON_BINARY, 'Non-binary'),
    )

    gender = serializers.ChoiceField(choices=GENDER, allow_blank=True, required=False)

class MaritalStatusSerializer(serializers.Serializer):
    SINGLE = 'S'
    MARRIED = 'M'
    DIVORCED = 'D'
    WIDOWED = 'W'
    MARITAL_STATUS = (
        (SINGLE, 'Single'),
        (MARRIED, 'Married'),
        (DIVORCED, 'Divorced'),
        (WIDOWED, 'Widowed'),
    )

    marital_status = serializers.ChoiceField(choices=MARITAL_STATUS, allow_blank=True, required=False)

class EducationSerializer(serializers.Serializer):
    TENTH = 'TE'
    TWELFTH = 'TW'
    COLLEGE = 'CO'
    GRADUATE = 'GR'
    POST_GRADUATE = 'PG'
    
    EDUCATION = (
        (TENTH, "10th (Middle School)"),
        (TWELFTH, "12th (High School)"),
        (COLLEGE, "In College"),
        (GRADUATE, "Graduate"),
        (POST_GRADUATE, "Post Graduate and Above"),
    )

    education = serializers.ChoiceField(choices=EDUCATION, allow_blank=True, required=False)

class IncomeSerializer(serializers.Serializer):
    NOT_ANSWERED = 0
    ONE = 1
    ONE_THREE = 2
    THREE_EIGHT = 3
    EIGHT_FIFTEEN = 4
    FIFTEEN_PLUS = 5
    INCOME = (
        (NOT_ANSWERED, "not answered"),
        (ONE, "less than 1 lpa"),
        (ONE_THREE, "1 to 3 lpa"),
        (THREE_EIGHT, "3 to 8 lpa"),
        (EIGHT_FIFTEEN, "8 to 15 lpa"),
        (FIFTEEN_PLUS, "15+ lpa"),
    )

    income = serializers.ChoiceField(choices=INCOME, allow_blank=True, required=False)

class AuditorRatingSerializer(serializers.Serializer):
    EXCELLENT = "E"
    GOOD = "G"
    AVERAGE = "A"
    WORSE = "W"
    AUDITOR_RATING = (
        (EXCELLENT, "Excellent"),
        (GOOD, "Good"),
        (AVERAGE, "Average"),
        (WORSE, "Worse"),
    )

    auditor_rating = serializers.ChoiceField(choices=AUDITOR_RATING, allow_blank=True, required=False)
class OccupationSerializer(serializers.Serializer):
    
    STUDENT = "STUDENT"
    SERVICE = "SERVICE"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    BUSINESS = "BUSINESS"
    UNEMPLOYED = "UNEMPLOYED"
    RETIRED = "RETIRED"
    OCCUPATION = (
        (STUDENT, 'student'),
        (SERVICE, 'service'),
        (SELF_EMPLOYED, 'self employed'),
        (BUSINESS, 'business'),
        (UNEMPLOYED, 'unemployed'),
        (RETIRED, 'retired'),
    )

    occupation = serializers.ChoiceField(choices=OCCUPATION, allow_blank=True, required=False)

class DistanceSerializer(serializers.Serializer):

    Upto_1_km = "1"
    Upto_5_km = "5"
    Upto_10_km = "10"
    Upto_20_km = "20"
    Upto_50_km = "50"
    Upto_100_km = "100" 
    DISTANCE = (
        (Upto_1_km, 'Upto 1 km'),
        (Upto_5_km, 'Upto 5 km'),
        (Upto_10_km, 'Upto 10 km'),
        (Upto_20_km,'Upto 20 km'),
        (Upto_50_km,'Upto 50 km'),
        (Upto_100_km, 'Upto 100 km'),
    )
    distance = serializers.ChoiceField(choices=DISTANCE, allow_blank=True, required=False)

class IndustrySerializer(serializers.Serializer):
    INDUSTRY = (
        (1, "Advertising and Marketing"),
        (2, "Agriculture"),
        (3, "Arts"),
        (4, "Architecture"),
        (5, "Advisory"),
        (6, "Accounting"),
        (7, "Aviation"),
        (8, "Apparel"),
        (9, "Automotive"),
        (10, "Banking"),
        (11, "Biotechnology"),
        (12, "Civil Engineering"),
        (13, "Civic-Social organization"),
        (14, "Consumer Goods and Services"),
        (15, "Cosmetics"),
        (16, "Entertainment"),
        (17, "Event Management"),
        (18, "Financial Services"),
        (19, "Food and Beverage"),
        (20, "Graphic Designing"),
        (21, "Health and Fitness"),
        (22, "Hospitality"),
        (23, "Import-Export Industry"),
        (24, "Information Technology"),
        (25, "Insurance"),
        (26, "Luxury Goods"),
        (27, "Management Consulting"),
        (28, "Market Research"),
        (29, "Medical"),
        (30, "Music"),
        (31, "Not for Profit"),
        (32, "Oil and Energy"),
        (33, "Pharmaceuticals"),
        (34, "Photography"),
        (35, "Real-Estate"),
        (36, "Retail Industry"),
        (37, "Sales"),
        (38, "Sports"),
        (39, "Supply Chain and Logistics"),
        (40, "Telecommunications"),
        (41, "Transportation"),
        (42, "Veterinary"),
        (43, "Other"),
    )

    industry = serializers.ChoiceField(choices=INDUSTRY, allow_blank=True, required=False)

class CarCostSerializer(serializers.Serializer):
    CAR_COST = (
        ("", ""),
        (1, "<3 lacs"),
        (2, "3 lacs – 5 lacs"),
        (3, "5 lacs – 10 lacs"),
        (4, "10 lacs – 15 lacs"),
        (5, "15 lacs and above"),
    )
    car_cost = serializers.ChoiceField(choices=CAR_COST, allow_blank=True, required=False)

class ResolutionSerializer(serializers.Serializer):

    ONE = 1
    FIVE = 2
    TEN = 3
    FIFTEEN = 4
    DONT_KNOW = 5
    NO_CAMERA = 6
    RESOLUTION = (
        (ONE, "1 to 5 megapixel"),
        (FIVE, "5 to 10 megapixel"),
        (TEN, "10 to 15 megapixel"),
        (FIFTEEN, "15+ megapixel"),
        (DONT_KNOW, "dont know"),
        (NO_CAMERA, "no camera"),
    )
    resolution = serializers.ChoiceField(choices = RESOLUTION, allow_blank = True, required=False)