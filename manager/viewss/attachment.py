from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

import attachment.service as attachment_service
from ..serializers import AttachmentSerializer

class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }

    def get(self, request, audit_store_id, format=None):
        try:
            attachments = attachment_service.find_by_audit_store(audit_store_id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound
