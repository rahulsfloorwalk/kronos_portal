from django.views import View
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.db.transaction import atomic
from django.http import JsonResponse
import json

from registration.service import market_place_api as market_place_service_api
from kronos.exceptions import ObjectNotFound
from registration.service import verification_service
from registration.service import auditor_api as auditor_service_api

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

# class MPSignUpAPITest(APIView):
#     permission_classes=[AllowAny]
#     @atomic
#     def post(self,request):
#         response,status = market_place_service_api.check_signup(request)
#         return JsonResponse(response, status=status)

# class MPLogInAPITest(APIView):
#     permission_classes=[AllowAny]
#     @atomic
#     def post(self,request):
#         response , status = market_place_service_api.check_log_in(request)
#         return JsonResponse(response, status=status)


# class MPVerfifyEmailByOtpTest(APIView):
#     permission_classes=[AllowAny]
#     @atomic
#     def post(self,request):
#         response , status = market_place_service_api.check_verify_by_otp_and_login(request)
#         return JsonResponse(response,status=status)

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

class MPLogOutAPI(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        if 'user_id' in request.session:
            del request.session['user_id']
        return JsonResponse({'message': 'User logged out successfully'})
    