from django.views import View
from django.db.transaction import atomic
from django.http import JsonResponse
import json
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
