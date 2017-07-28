from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from monitoring.service import email_log_service

class EmailLogByEmail(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, to_email):
        emails = email_log_service.find_email_log_by_email(to_email)
        return Response(emails)

class EmailLogHTMLViewById(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER]
        }
    def get(self, request, email_log_id):
        email = email_log_service.find_email_log_by_id(email_log_id)
        return HttpResponse(email.html_body)

class EmailLogTextViewById(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER]
        }
    def get(self, request, email_log_id):
        email = email_log_service.find_email_log_by_id(email_log_id)
        return HttpResponse("<!DOCTYPE><html><body><pre>{}</pre></body></html>".format(email.text_body))
