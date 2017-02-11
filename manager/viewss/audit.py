from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit.models import Audit
from ..service import audit as audit_service
from ..serializers import AuditSerializer, AuditDeSerializer

class AuditByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id).all()
            serial_audits = AuditSerializer(audits, many=True).data
            return Response(serial_audits)
        except Audit.DoesNotExist:
            raise Http404

class AuditIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, audit_id, format=None):
        try:
            audit = Audit.objects.get(pk=audit_id)
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            return Http404

    def post(self, request, audit_id):
        try:
            audit_ds = AuditDeSerializer(data=request.data, context={'id':audit_id})
            audit_ds.is_valid(raise_exception=True)
            audit = audit_ds.deserialize()
            audit = audit_service.save(audit)
            return Response(AuditSerializer(audit).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

    def delete(self, request, audit_id):
        try:
            audit = Audit.objects.get(audit_id)
            audit.delete()
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            raise Http404

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request):
        try:
            audit_ds = AuditDeSerializer(data=request.data)
            audit_ds.is_valid(raise_exception=True)
            audit = audit_ds.deserialize()
            audit_service.save(audit)
            return Response(AuditSerializer(audit).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })
