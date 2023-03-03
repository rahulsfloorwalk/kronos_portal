from rest_framework.response import Response
from rest_framework.views import APIView
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR
from rest_framework.authentication import TokenAuthentication
from rest_framework.serializers import Serializer, CharField, BooleanField
from .service import auditor_api as auditor_service_api
from .service import preferences_service
from registration.service import auditor as auditor_registration
from .serializers import UserAPISerializer, PreferencesSerializer


class ChangePasswordDeSerializer(Serializer):
    old_password = CharField(min_length=8, max_length=128)
    new_password = CharField(min_length=8, max_length=128)


class ChangePasswordView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    def post(self, request):
        ds = ChangePasswordDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        response = auditor_service_api.change_password(
            request.user.id,
            ds.validated_data['old_password'],
            ds.validated_data['new_password']
        )
        return Response(response)


class DashboardView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }

    def get(self, request):
        response = auditor_service_api.get_auditor_dashboard_data(request.user.id)
        return Response(response)


class AuditorProfileView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }

    def get(self, request):
        auditor = auditor_registration.find_auditor_by_id(request.user.id)
        return Response(UserAPISerializer(auditor).data)


class AuditorOpportunityEmail(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    class DeSerializer(Serializer):
        receive_new_opportunities_email = BooleanField()

    def post(self, request):
        prefs_ds = self.DeSerializer(data=request.data)
        prefs_ds.is_valid(raise_exception=True)
        preference = preferences_service.set_preferences(request.user.id, prefs_ds.validated_data)
        return Response(PreferencesSerializer(preference).data)


class AuditorOpportunitySMS(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    class DeSerializer(Serializer):
        receive_new_opportunities_sms = BooleanField()

    def post(self, request):
        prefs_ds = self.DeSerializer(data=request.data)
        prefs_ds.is_valid(raise_exception=True)
        preference = preferences_service.set_preferences(request.user.id, prefs_ds.validated_data)
        return Response(PreferencesSerializer(preference).data)
