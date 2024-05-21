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

from django.views import View
from django.db.transaction import atomic
from django.http import JsonResponse
import json
from registration.mixins import HasGroupPermission
from rest_framework.permissions import AllowAny,IsAuthenticated

class AppSignUpAPI(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response,status = auditor_service_api.sign_up_auditor_app(request)
        return JsonResponse(response, status=status)
    
class AppVerfifyEmailByOtp(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response , status = auditor_service_api.verify_by_otp_and_login(request)
        return JsonResponse(response,status=status)   


class LoginAPI(APIView):
    permission_classes = [AllowAny]
    @atomic
    def post(self, request):
        response, status_code = auditor_service_api.log_in_app(request)
        return Response(response, status=status_code)

class LogoutAPI(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        if 'user_id' in request.session:
            del request.session['user_id']
        return JsonResponse({'message': 'User logged out successfully'})
    
class ChangePasswordDeSerializer(Serializer):
    old_password = CharField(min_length=8, max_length=128)
    new_password = CharField(min_length=8, max_length=128)


class ChangePasswordAPI(APIView):
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
    

class ForgotPasswordAPI(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        response,status = auditor_service_api.forgot_password(request.data)
        return JsonResponse(response,status=status)


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        response, status = auditor_service_api.password_reset_confirm(request, uidb64, token)
        return JsonResponse(response, status=status)


class VerifyAndForgotPasswordAPI(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        response,status = auditor_service_api.verify_otp_for_forgot_password(request.data)
        return JsonResponse(response,status=status)


class SetPasswordAPI(APIView):
    permission_classes=[HasGroupPermission]
    required_group={
        'POST':[GROUP_NAME_AUDITOR]
    }
    def post(self,request):
        response,status = auditor_service_api.set_password(request)
        return JsonResponse(response,status=status) 
  

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
