from django.contrib.auth.models import User
from auditor.service.profile_info_service import get_avg_auditor_rating_by_user
from billing.models import Payment
from kronos.exceptions import AppLogicError
from kronos.utils import validate_url
from rest_framework import serializers
from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, CharField, EmailField, BooleanField, FileField

from agency.models import AgencyUser, Agency
from questionnaire.models.questionnaire import Industry, ProblemStatement, SampleQuestionnaireType
from registration.models import MobileNumber
from audit.models import AuditCycle, Audit, AuditLocation
from audit_store.models import AuditStore
from client.models import BankInfo, Client, ClientUser, Quotation, Store
from auditor.models import ProfileInfo, AuditApplication
from manager.models import City
from questionnaire.models import QuestionnaireType


class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
            'logo_url',
            'address',
            'company_website_url',
            'receive_email_notification'
        )
        read_only_fields = ['id']

    def validate_company_website_url(self, value):
        valid = validate_url(value)
        if not valid:
            raise serializers.ValidationError('Invalid url')
        return value

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
        client.address = self.validated_data.get('address', client.address)
        client.company_website_url = self.validated_data.get('company_website_url', client.company_website_url)
        client.receive_email_notification = self.validated_data.get('receive_email_notification', client.receive_email_notification)
        return client


class ClientPlainSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name'
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
            'post_approval_description',
            'check_points',
            'client',
            'audit_count',
            'completed_audit_count',
            'questionnaire_type',
            'audit_alignment_factors',
            'audit_auto_approve',
            'created_by_client',
        )
        read_only_fields = fields


class AuditCyclePlainSerializer(ModelSerializer):
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
            'post_approval_description',
            'created_by_client',
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
            'planned_audit',
            'earnings_per_audit',
            'reimbursement',
            'description',
            'client',
            'questionnaire_type',
            'audit_auto_approve',
            'created_by_client',
        )
        read_only_fields = ('id',)


    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit_cycle = AuditCycle.objects.get(id=self.context.get('id'))
        else:
            audit_cycle = AuditCycle()
            audit_cycle.created_by_client = True
        audit_cycle.name = self.validated_data.get('name', audit_cycle.name)
        audit_cycle.type = self.validated_data.get('type', audit_cycle.type)
        audit_cycle.status = self.validated_data.get('status', audit_cycle.status)
        audit_cycle.start_date = self.validated_data.get('start_date', audit_cycle.start_date)
        audit_cycle.end_date = self.validated_data.get('end_date', audit_cycle.end_date)
        audit_cycle.planned_audit = self.validated_data.get('planned_audit', audit_cycle.planned_audit)
        audit_cycle.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit_cycle.earnings_per_audit)
        audit_cycle.reimbursement = self.validated_data.get('reimbursement', audit_cycle.reimbursement)
        audit_cycle.description = self.validated_data.get('description', audit_cycle.description)
        audit_cycle.audit_auto_approve = self.validated_data.get('audit_auto_approve', audit_cycle.audit_auto_approve)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        return audit_cycle


class QuestionnaireTypeSerializer(ModelSerializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    class Meta:
        model = QuestionnaireType
        fields = (
            'id',
            'name',
            'is_default',
            'client',
            'client_id',
        )
        read_only_fields = ('id',)


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
            'tier',
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
            'type',
            'priority',
            'phone',
            'city',
            'map_location_link',
        )
        read_only_fields = fields

    def validate(self, attrs):
        store_id=self.context.get('id', '')
        client = attrs.get('client', '')
        code = attrs.get('code', '')

        try:
            obj = Store.objects.get(client=client, code=code)
        except Store.DoesNotExist:
            return attrs

        if store_id and str(obj.id) == str(store_id):
            return attrs
        else:
            raise serializers.ValidationError('Store code is already exists')


class StoreDeSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'client',
            'code',
            'pincode',
            'type',
            'phone',
            'priority',
            'city',
            'map_location_link',
        )
        read_only_fields = ('id',)
        validators=[]

    def validate(self, attrs):
        store_id=self.context.get('id', '')
        client = attrs.get('client', '')
        code = attrs.get('code', '')

        try:
            obj = Store.objects.get(client=client, code=code)
        except Store.DoesNotExist:
            return attrs

        if store_id and str(obj.id) == str(store_id):
            return attrs
        else:
            raise serializers.ValidationError('Store code is already exists')

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
        store.pincode = self.validated_data.get('pincode', store.pincode)
        store.type = self.validated_data.get('type', store.type)
        store.priority = self.validated_data.get('priority', store.priority)
        store.phone = self.validated_data.get('phone', store.phone)
        store.map_location_link = self.validated_data.get('map_location_link', store.map_location_link)
        return store


class MobileNumberSerializer(ModelSerializer):
    class Meta:
        model = MobileNumber
        fields = (
            'mobile_number',
            'is_verified',
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


class ClientUserSerializer(ModelSerializer):
    client = ClientSerializer()
    user = PlainUserSerializer()
    class Meta:
        model = ClientUser
        fields = (
            'id',
            'full_name',
            'client',
            'user',
            'is_client_admin',
            'receive_email_notification',
        )
        read_only_fields = fields


class ClientUserDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    full_name = CharField(max_length=50)
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    is_client_admin = BooleanField()
    receive_email_notification = BooleanField()


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
            'avg_auditor_rating',
            'auditor_rating'
        )
        read_only_fields = fields

    def get_avg_auditor_rating(self, obj):
        return get_avg_auditor_rating_by_user(obj.user)


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


class AuditSerializer(ModelSerializer):
    store = StoreSerializer()
    audit_cycle = AuditCyclePlainSerializer()
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
            'check_points',
            'audit_store_percentage'
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
            'report_exists_data',
            'distance',
            'comment',
            'profile_match_percentage'
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


class ClientBankInfoSerializer(ModelSerializer):
    class Meta:
        model = BankInfo
        fields = (
            'id',
            'gstin',
            'pan_number',
        )
        read_only_fields = ['id']

    def deserialize(self):
        if self.context.get('client_id') is not None:
            try:
                bank_info = BankInfo.objects.get(client_id=self.context.get('client_id'))
            except BankInfo.DoesNotExist as e:
                bank_info = BankInfo()
                bank_info.client_id = self.context.get('client_id')
        else:
            bank_info = BankInfo()
            bank_info.client_id = self.context.get('client_id')
        bank_info.gstin = self.validated_data.get('gstin', bank_info.gstin)
        bank_info.pan_number = self.validated_data.get('pan_number', bank_info.pan_number)
        return bank_info


class ClientCheckOutSerializer(Serializer):
    company_name = CharField(max_length = 200, required=True)
    billing_name = CharField(max_length = 200, required=True)
    address = CharField(max_length = 400, required=True)
    postal_code = CharField(max_length = 100, required=True)
    city = CharField(max_length = 100, required=True)
    country = CharField(max_length = 100, required=True)
    po_number = CharField(max_length = 100, required=False)
    gstin_number = CharField(max_length = 100, required=False)
    payable_amount = CharField(required=True)

    def validate(self, attrs):
        payable_amount = attrs.get('payable_amount', '')
        if not payable_amount:
            raise serializers.ValidationError("Please enter payable amount")
        # if int(payable_amount) < int(settings.MINIMUM_PAYMOUNT_AMOUNT):
        #     raise serializers.ValidationError("Minimum payable amount should be {}".format(settings.MINIMUM_PAYMOUNT_AMOUNT))
        return super().validate(attrs)


class ClientPaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'amount',
            'status',
            'paid_on',
            'added_on',
            'invoice_number',
        )
        read_only_fields = fields

class AuditLocationSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = AuditLocation
        fields = '__all__'

class IndustrySerializer(ModelSerializer):
    class Meta:
        model = Industry
        fields = '__all__'

class ProblemStatementSerializer(ModelSerializer):
    class Meta:
        model = ProblemStatement
        fields = '__all__'

class SampleQuestionnaireTypeSerializer(ModelSerializer):
    class Meta:
        model = SampleQuestionnaireType
        fields = '__all__'

class QuotationSerializer(ModelSerializer):
    audit_locations = AuditLocationSerializer(many=True)
    industry = IndustrySerializer()
    problem_statement = ProblemStatementSerializer()
    sample_questionnaire_type = SampleQuestionnaireTypeSerializer()

    class Meta:
        model = Quotation
        fields = (
            'id',
            'industry',
            'problem_statement',
            'sample_questionnaire_type',
            'amount',
            'payable_amount',
            'gst',
            'gst_amount',
            'discount',
            'audit_locations',
            'quotation_data',
            'status',
            'client',
            'created_at',
            'modified_at',
        )
        read_only_fields = fields


class QuotationPlainSerializer(ModelSerializer):
    class Meta:
        model = Quotation
        fields = (
            'id',
            'industry',
            'problem_statement',
            'sample_questionnaire_type',
            'amount',
            'payable_amount',
            'gst',
            'gst_amount',
            'discount',
            'quotation_data',
            'status',
            'client',
            'created_at',
            'modified_at',
        )
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


class AuditCycleWithQuotationSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'start_date',
            'end_date',
            'planned_audit',
            'description',
            'created_by_client',
            'client',
            'questionnaire_type',
            'type',
            'status',
            'quotation',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit_cycle = AuditCycle.objects.get(id=self.context.get('id'))
        else:
            audit_cycle = AuditCycle()
        audit_cycle.name = self.validated_data.get('name', audit_cycle.name)
        audit_cycle.start_date = self.validated_data.get('start_date', audit_cycle.start_date)
        audit_cycle.end_date = self.validated_data.get('end_date', audit_cycle.end_date)
        audit_cycle.planned_audit = self.validated_data.get('planned_audit', audit_cycle.planned_audit)
        audit_cycle.description = self.validated_data.get('description', audit_cycle.description)
        audit_cycle.created_by_client = self.validated_data.get('created_by_client', audit_cycle.created_by_client)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        audit_cycle.status = self.validated_data.get('status', audit_cycle.status)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        audit_cycle.type = self.validated_data.get('type', audit_cycle.type)
        audit_cycle.quotation = self.validated_data.get('quotation', audit_cycle.quotation)
        return audit_cycle