from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, DateField
from rest_framework import generics

from rest_framework.filters import SearchFilter

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from auditor.serializers import ProfileInfoSerializer, BankInfoSerializer, AdditionalInfoSerializer, AuditorSerializer

class AuditorView(generics.ListAPIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    queryset = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.all();
    serializer_class = AuditorSerializer
    filter_backends = (SearchFilter,)
    search_fields = ('email','profileinfo__first_name','profileinfo__last_name','profileinfo__mobile_number',)


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
