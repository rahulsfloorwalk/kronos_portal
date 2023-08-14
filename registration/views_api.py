from django.views import View
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.db.transaction import atomic
from django.http import JsonResponse
import json
from rest_framework.response import Response
from registration.models import GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission
from registration.service import market_place_api as market_place_service_api
from kronos.exceptions import ObjectNotFound
from registration.service import verification_service
from registration.service import auditor_api as auditor_service_api
from rest_framework.serializers import Serializer, CharField, BooleanField
class SignUpAPI(View):
    @atomic
    def post(self, request):
        response, status = auditor_service_api.sign_up_auditor(data=json.loads(request.body.decode('utf-8')))
        return JsonResponse(response, status=status)


class LoginAPI(View):
    @atomic
    def post(self, request):
        response, status = auditor_service_api.login_auditor(data=json.loads(request.body.decode('utf-8')))
        return JsonResponse(response, status=status)

class MPSignUpAPI(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response,status = market_place_service_api.sign_up_market_place(request)
        return JsonResponse(response, status=status)

class MPLogInAPI(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response , status = market_place_service_api.log_in_market_place(request)
        return JsonResponse(response, status=status)


class MPVerfifyEmailByOtp(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response , status = market_place_service_api.verify_by_otp_and_login(request)
        return JsonResponse(response,status=status)    

class ChangePasswordDeSerializer(Serializer):
    old_password = CharField(min_length=8, max_length=128)
    new_password = CharField(min_length=8, max_length=128)

class MPChangePasswordAPI(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'POST':[GROUP_NAME_CLIENT]
    }
    def post(self,request):
        ds = ChangePasswordDeSerializer(data=request.data)
        ds.is_valid(raise_exception= True)
        response = market_place_service_api.change_password(
            request.user.id,
            ds.validated_data['old_password'],
            ds.validated_data['new_password']
        )
        return Response(response)
class MPForgotPasswordAPI(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        response,status = market_place_service_api.forgot_password(request.data)
        return JsonResponse(response,status=status)

class MPVerifyAndForgotPasswordAPI(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        response,status = market_place_service_api.verify_otp_for_forgot_password(request.data)
        return JsonResponse(response,status=status)

class MPSetPasswordAPI(APIView):
    permission_classes=[HasGroupPermission]
    required_group={
        'POST':[GROUP_NAME_CLIENT]
    }
    def post(self,request):
        response,status = market_place_service_api.set_password(request)
        return JsonResponse(response,status=status) 
  
class MPLogOutAPI(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        if 'user_id' in request.session:
            del request.session['user_id']
        return JsonResponse({'message': 'User logged out successfully'})
    