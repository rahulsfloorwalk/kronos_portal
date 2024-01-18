from django.contrib.auth.models import User
from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, FileField, SerializerMethodField,ListField,ImageField
from auditor.service.profile_info_service import get_avg_auditor_rating_by_user
from kronos.exceptions import AppLogicError
from agency.models import AgencyUser, Agency
from audit.models import Audit, AuditCycle, AuditCycleProofTagList
from audit_store.models import AuditStore, ReportFollowUpLog
from auditor.models import ProfileInfo, AuditApplication
from client.models import Client, Store,ClientForEcomm
from payment.models import Payment
from registration.models import MobileNumber
from .models import City, ProofTag,MPCategory,MPTax,MPSolution
from manager.viewss.questionnaire_type import QuestionnaireTypeSerializer
from attachment.models import Attachment
from manager.models import ManagerProfileInfo
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
            'receive_email_notification',
            'address',
            'city',
            'state',
            'pincode',
            'gst_in'
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
        client.receive_email_notification = self.validated_data.get('receive_email_notification', client.receive_email_notification)
        client.address= self.validated_data.get('address',client.address)
        client.city = self.validated_data.get('city',client.city)
        client.state = self.validated_data.get('state',client.state)
        client.pincode = self.validated_data.get('pincode',client.pincode)
        client.gst_in = self.validated_data.get('gst_in',client.gst_in)
        
        return client

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
            'country',
            'state_name',
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
            'planned_audit',
            'earnings_per_audit',
            'reimbursement',
            'charge_per_audit',
            'system_cost',
            'description',
            'eligibility',
            'post_approval_description',
            'check_points',
            'client',
            'audit_count',
            'completed_audit_count',
            'questionnaire_type',
            'audit_alignment_factors',
            'audit_auto_approve',
        )
        read_only_fields = fields


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
            'pincode',
            'map_location_link',
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
            'pincode',
            'map_location_link',
            'type',
            'priority',
            'phone',
            'city',
            'client_id',
            'city_id',
        )
        read_only_fields = fields


class ProfileInfoSmallSerializer(ModelSerializer):
    avg_auditor_rating = SerializerMethodField()
    class Meta:
        model = ProfileInfo
        fields = (
            'id',
            'first_name',
            'last_name',
            'mobile_number',
            'city',
            'user_id',
            'pincode',
            'auditor_rating',
            'avg_auditor_rating',
            'certification_score'
        )
        read_only_fields = fields

    def get_avg_auditor_rating(self, obj):
        return get_avg_auditor_rating_by_user(obj.user)


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
            'is_automation_approve',
            'is_instant_approve',
            'profileinfo',
            'avg_qa_rating',
            'report_exists',
            'report_exists_data',
            'distance',
            'comment',
            'profile_match_percentage',
            'auditor_audit_count',
            'is_super_auditor'
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

class ManagerProfileInfoSerializer(ModelSerializer):
    class Meta:
        model = ManagerProfileInfo
        fields = ('mobile',)

class PlainUserSerializer(ModelSerializer):
    mobile_numbers = MobileNumberSerializer(many=True)
    # mobile = ManagerProfileInfoSerializer(many=True)
    mobile = SerializerMethodField()
    name = SerializerMethodField()
    is_admin = SerializerMethodField()
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'is_active',
            'mobile_numbers',
            'name',
            'mobile',
            'is_admin'
        )
        read_only_fields = fields
    def get_mobile(self, obj):
        try:
            manager_profile_info = ManagerProfileInfo.objects.get(user=obj)
            return manager_profile_info.mobile
        except ManagerProfileInfo.DoesNotExist:
            return None
        
    def get_name(self, obj):
        try:
            manager_profile_info = ManagerProfileInfo.objects.get(user=obj)
            return manager_profile_info.name
        except ManagerProfileInfo.DoesNotExist:
            return None
    def get_is_admin(self, obj):
        try:
            manager_profile_info =ManagerProfileInfo.objects.get(user=obj)
            return manager_profile_info.is_admin
        except ManagerProfileInfo.DoesNotExist:
            return None

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

class AuditStoreSerializer(ModelSerializer):
    audit = AuditSerializer()
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
            'auto_assigned',
            'instant_assigned',
            'assigned_to_moderator',
            'qa_rating',
            'earnings_per_audit',
            'reimbursement',
            'report_summary',
            'attribute_data',
            'moderator_status',
            'moderator_comment',
            'find_faulty_report_count',
            'check_points',
            'audit_store_percentage',
            'report_revert_count'
        )
        read_only_fields = fields

class AuditStoreSerializerWithoutAudit(ModelSerializer):
    user = UserSerializer()
    assigned_to_moderator = PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'auto_assigned',
            'instant_assigned',
            'audit',
            'user',
            'qa_rating',
            'assigned_to_moderator',
            'attribute_data',
            'report_revert_count'
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
        read_only_fields = ('id',)


class AuditCycleProofTagListSerializer(ModelSerializer):
    proof_tag = ProofTagSerializer()
    class Meta:
        model = AuditCycleProofTagList
        fields = (
            'id',
            'is_active',
            'proof_tag'
        )
        read_only_fields = fields


class UserSerializerWithUserDetails(ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email'
        )
        read_only_fields = fields


class AuditStoreSerializerWithUser(ModelSerializer):
    user = UserSerializerWithUserDetails()
    class Meta:
        model = AuditStore
        fields = ['user']
        read_only_fields = fields


class AuditStoreFollowUpSerializer(ModelSerializer):
    user_actor = UserSerializerWithUserDetails()
    class Meta:
        model = ReportFollowUpLog
        fields = ['id', 'audit_store', 'user_actor', 'comment', 'next_follow_up_date']
        read_only_fields = fields


class StoreImportDeSerializer(Serializer):
    file_uploaded = FileField()

    class Meta:
        fields = ['file_uploaded']

    def validate(self, attrs):
        file_uploaded = attrs.get('file_uploaded', '')
        if not file_uploaded:
            raise AppLogicError('Please upload the attachment')
        if file_uploaded.name.split('.')[-1] not in ['xls','xlsx']:
            raise AppLogicError('Invalid File Type')
        return super().validate(attrs)


class ClientForEcommSerializer(ModelSerializer):
    class Meta:
        model = ClientForEcomm
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'company',
            'password',
            'address',
            'city',
            'state',
            'pincode',
            'gst_in'
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if self.context.get('id') is not None:
            client = ClientForEcomm.objects.get(id=self.context.get('id'))
        else:
            client = ClientForEcomm()
        client.first_name = self.validated_data.get('first_name', client.first_name)
        client.last_name = self.validated_data.get('last_name', client.last_name)
        client.email = self.validated_data.get('email', client.email)
        client.phone_number = self.validated_data.get('phone_number', client.phone_number)
        client.company = self.validated_data.get('company',client.city)
        client.password = self.validated_data.get('password',client.password)
        client.address= self.validated_data.get('address',client.address)
        client.city = self.validated_data.get('city',client.city)
        client.state = self.validated_data.get('state',client.state)
        client.pincode = self.validated_data.get('pincode',client.pincode)
        client.gst_in = self.validated_data.get('gst_in',client.gst_in)
        
        return client
    
class TaxSerializer(ModelSerializer):
    class Meta:
        model = MPTax
        fields = (
            'id',
            'name',
            'rate',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if self.context.get('id') is not None:
            tax = MPTax.objects.get(id=self.context.get('id'))
        else:
            tax = MPTax()
        tax.name = self.validated_data.get('name', tax.name)
        tax.rate = self.validated_data.get('rate', tax.rate)
        
        return tax
    
class CategorySerializer(ModelSerializer):
    class Meta:
        model = MPCategory
        fields = (
            'id',
            'name',
            'url_structure',
            'overview',
            'short_description',
        )
    def deserialize(self):
        if self.context.get('id') is not None:
            category = MPCategory.objects.get(id=self.context.get('id'))
        else:
            category = MPCategory()
        category.name = self.validated_data.get('name', category.name)
        category.url_structure = self.validated_data.get('url_structure', category.url_structure)
        category.overview = self.validated_data.get('overview', category.overview)
        category.short_description = self.validated_data.get('short_description', category.short_description)
        return category
        
        
        
    
class SolutionStatusSerializer(ModelSerializer):
    class Meta:
        model=MPSolution
        fields = (
            'id',
            'is_active'
        )
        read_only_fields = ('id',)
        
class SolutionShowSerializer(ModelSerializer):
    class Meta:
        model=MPSolution
        fields = (
            'id',
            'is_show'
        )
        read_only_fields = ('id',)
class SolutionPopularStatusSerializer(ModelSerializer):
    class Meta:
        model=MPSolution
        fields = (
            'id',
            'is_popular'
        )
        read_only_fields = ('id',)
class SolutionSerializer(ModelSerializer):
    tax= TaxSerializer()
    class Meta:
        model = MPSolution
        fields = (
            'id',
            'name',
            'url_structure',
            'price',
            'tax',
            'overview',
            'how_it_work',
            'execution_time',
            'short_description',
            'is_active',
            'is_popular'
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
            'proof_tag',
        )
        read_only_fields = fields
    