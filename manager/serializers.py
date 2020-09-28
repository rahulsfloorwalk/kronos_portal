from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField

from agency.models import AgencyUser, Agency
from audit.models import Audit, AuditCycle, AuditCycleProofTagList
from audit_store.models import AuditStore
from auditor.models import ProfileInfo, AuditApplication
from client.models import Client, Store
from payment.models import Payment
from registration.models import MobileNumber
from .models import City, ProofTag
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
            'receive_email_notification',
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
            'earnings_per_audit',
            'reimbursement',
            'description',
            'post_approval_description',
            'check_points',
            'client',
            'audit_count',
            'questionnaire_type',
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


class ProfileInfoSmallSerializer(ModelSerializer):
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
            'auditor_rating'
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
            'report_exists',
            'distance'
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
            'assigned_to_moderator',
            'qa_rating',
            'earnings_per_audit',
            'reimbursement',
            'report_summary',
            'attribute_data',
            'moderator_status',
            'moderator_comment',
            'find_faulty_report_count',
            'check_points'
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
            'audit',
            'user',
            'qa_rating',
            'assigned_to_moderator',
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
