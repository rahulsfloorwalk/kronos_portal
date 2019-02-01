from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import BooleanField, Serializer, ModelSerializer

import attachment.service_auditor as attachment_auditor_service
import auditor.service.stats as auditor_stats_service
import registration.service.auditor as auditor_service
from auditor.service import profile_info_service, bank_info_service, additional_info_service
from auditor.service import preferences_service
from manager.serializers import FacebookSerializer
from manager.serializers import PaymentSerializer
from manager.serializers import ProfileInfoSerializer, BankInfoSerializer
from manager.serializers import AdditionalInfoSerializer, AuditorSerializer, AttachmentSerializer
from payment.service import payment_manager as payment_service
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from ..serializers import AuditorReferralSerializer
from social.service import social_manager as social_service
from referral.service import referral_auditor as referral_service
from auditor.models import Preferences


class AuditorView(generics.ListAPIView):
    class AuditorViewPaginationClass(PageNumberPagination):
        page_size = 800
        page_size_query_param = 'page_size'
        max_page_size = 1000

    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    queryset = User.objects.filter(groups__name=GROUP_NAME_AUDITOR).order_by('-date_joined')
    serializer_class = AuditorSerializer
    filter_backends = (SearchFilter,)
    pagination_class = AuditorViewPaginationClass
    search_fields = ('email','profileinfo__first_name','profileinfo__last_name','profileinfo__mobile_number','profileinfo__city__name')


class AuditorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        user = auditor_service.find_auditor_by_id(auditor_id)
        return Response(AuditorSerializer(user).data)

class AuditorIdEmailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id, format=None):
        user = auditor_service.set_email(user_id, request.data.get('email'))
        return Response(AuditorSerializer(user).data)

class AuditorIdMobileNumberView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id, format=None):
        user = profile_info_service.set_mobile_number_for_manager(user_id, request.data.get('mobile_number'))
        return Response(AuditorSerializer(user).data)

class AuditorProfileInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        profile_info = profile_info_service.find_profile_info_by_user_id(auditor_id)
        return Response(ProfileInfoSerializer(profile_info).data)

class AuditorBankInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        bank_info = bank_info_service.find_bank_info_by_user_id(auditor_id)
        return Response(BankInfoSerializer(bank_info).data)

class AuditorAdditionalInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        additional_info = additional_info_service.find_additional_info_by_user_id(auditor_id)
        return Response(AdditionalInfoSerializer(additional_info).data)

class AuditorFacebookInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        facebookInfo = social_service.find_facebook_by_user(auditor_id)
        return Response(FacebookSerializer(facebookInfo).data)

class AuditorApplicationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        auditor_applications = auditor_stats_service.getAuditApplications(auditor_id)
        return Response(auditor_applications)

class AuditorAuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, auditor_id, format=None):
        auditor_audit_stores = auditor_stats_service.getAuditStores(auditor_id)
        return Response(auditor_audit_stores)

class AuditorDeactivateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id):
        user = auditor_service.deactivate_auditor(user_id)
        return Response(AuditorSerializer(user).data)

class AuditorActivateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id):
        user = auditor_service.activate_auditor(user_id)
        return Response(AuditorSerializer(user).data)

class AuditorVerifyView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id):
        user = auditor_service.verify_auditor(user_id)
        return Response(AuditorSerializer(user).data)

class AuditorPasswordResetEmailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, user_id):
        user = auditor_service.send_password_reset_email(user_id)
        return Response(AuditorSerializer(user).data)

class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, user_id, format=None):
        payments = payment_service.find_by_user(user_id)
        return Response(PaymentSerializer(payments, many=True).data)

class IdProofAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, auditor_id, format=None):
        attachments = attachment_auditor_service.find_id_proof_for_auditor(auditor_id)
        return Response(AttachmentSerializer(attachments, many=True).data)

class ReferralView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, auditor_id, format=None):
        referrals = referral_service.find_by_referred_by(auditor_id)
        return Response(AuditorReferralSerializer(referrals, many=True).data)

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

class PreferencesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        receive_new_opportunities_email = BooleanField()
        receive_new_opportunities_sms = BooleanField()

    def get(self, request, auditor_id, format=None):
        preference = preferences_service.find_preferences_by_user_id(auditor_id)
        return Response(PreferencesSerializer(preference).data)

    def post(self, request, auditor_id, format=None):
        prefs_ds = self.DeSerializer(data=request.data)
        prefs_ds.is_valid(raise_exception=True)
        preference = preferences_service.set_preferences(auditor_id, prefs_ds.validated_data)
        return Response(PreferencesSerializer(preference).data)
