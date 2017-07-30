from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

import attachment.service_auditor as attachment_auditor_service
import auditor.service.stats as auditor_stats_service
import registration.service.auditor as auditor_service
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from kronos.exceptions import ObjectNotFound
from manager.serializers import PaymentSerializer
from payment.service import payment_manager as payment_service
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from ..serializers import ProfileInfoSerializer, BankInfoSerializer, AdditionalInfoSerializer, AuditorSerializer, AttachmentSerializer

class AuditorView(generics.ListAPIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    queryset = User.objects.filter(groups__name=GROUP_NAME_AUDITOR)
    serializer_class = AuditorSerializer
    filter_backends = (SearchFilter,)
    search_fields = ('email','profileinfo__first_name','profileinfo__last_name','profileinfo__mobile_number','profileinfo__city__name')


class AuditorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        auditor = User.objects.get(id=auditor_id);
        return Response(AuditorSerializer(auditor).data)

class AuditorProfileInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        try:
            profileInfo = ProfileInfo.objects.get(user_id=auditor_id)
            return Response(ProfileInfoSerializer(profileInfo).data)
        except ProfileInfo.DoesNotExist:
            return Response(ProfileInfoSerializer(ProfileInfo(user_id=auditor_id)).data)

class AuditorBankInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        try:
            bankInfo = BankInfo.objects.get(user_id=auditor_id)
            return Response(BankInfoSerializer(bankInfo).data)
        except BankInfo.DoesNotExist:
            return Response(BankInfoSerializer(BankInfo(user_id=auditor_id)).data)

class AuditorAdditionalInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        try:
            additionalInfo = AdditionalInfo.objects.get(user_id=auditor_id)
            return Response(AdditionalInfoSerializer(additionalInfo).data)
        except AdditionalInfo.DoesNotExist:
            return Response(AdditionalInfoSerializer(AdditionalInfo(user_id=auditor_id)).data)

class AuditorApplicationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        try:
            auditor_applications = auditor_stats_service.getAuditApplications(auditor_id)
            return Response(auditor_applications)
        except ObjectNotFound:
            raise NotFound

class AuditorAuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER]
        }
    def get(self, request, auditor_id, format=None):
        try:
            auditor_audit_stores = auditor_stats_service.getAuditStores(auditor_id)
            return Response(auditor_audit_stores)
        except ObjectNotFound:
            raise NotFound

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

class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER]
        }
    def get(self, request, user_id, format=None):
        try:
            payments = payment_service.find_by_user(user_id)
            return Response(PaymentSerializer(payments, many=True).data)
        except ObjectNotFound:
            raise NotFound

class IdProofAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER]
        }

    def get(self, request, auditor_id, format=None):
        try:
            attachments = attachment_auditor_service.find_id_proof_for_auditor(auditor_id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound