from django.views import View
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.transaction import atomic
from django.http import JsonResponse
import json
from registration.service import market_place_api as market_place_service_api
from kronos.exceptions import ObjectNotFound

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
        response,status = market_place_service_api.sign_up_market_place(data=request.data)
        return JsonResponse(response, status=status)
class MPLogInAPI(APIView):
    permission_classes=[AllowAny]
    @atomic
    def post(self,request):
        response , status = market_place_service_api.log_in_market_place(data=request.data)
        return JsonResponse(response, status=status)

@atomic
def verify_email(request, otp,email):
    return request,otp,email
    # try:
    #     if market_place_service_api.otp==otp:
    #         login(request,request.user.id,backend='')
    # except ObjectNotFound as e:
    #     pass
    # return JsonResponse('Valid OTP')
    
    # try:
    #     verification = verification_service.verify_by_activation_key(key)
    #     login(request, verification.user, backend='registration.backends.CaseInsensitiveModelBackend')
    # except ObjectNotFound as e:
    #     _logger.debug("verification failed for key: %s", key)
    # return redirect('registration:client_login')
