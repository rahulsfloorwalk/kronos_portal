from django.contrib.auth.models import User, Group
from django.http import HttpResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, DateField
from rest_framework import generics

from rest_framework.filters import SearchFilter

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service
from manager.serializers import AuditCycleSerializer, AuditCycleDeSerializer

from client_report.service import audit_cycle_xlsx_report as xlsx_report_service

class AuditCycleViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, client_id, format=None):
        try:
            audit_cycles = AuditCycle.objects.filter(client_id=client_id).all()
            return Response(AuditCycleSerializer(audit_cycles, many=True).data)
        except AuditCycle.DoesNotExist:
            raise Http404

class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, format=None):
        audit_cycles = AuditCycle.objects.all()
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

    def post(self, request):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data)
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
            return Response(AuditCycleSerializer(audit_cycle).data)
        except AuditCycle.DoesNotExist:
            return Http404

    def post(self, request, audit_cycle_id):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data, context={'id': audit_cycle_id})
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

    def delete(self, request, audit_cycle_id):
        try:
            audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
            audit_cycle.delete()
            return Response(AuditCycleSerializer(audit).data)
        except AuditCycle.DoesNotExist:
            return Http404

class AuditCycleXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            report, name = xlsx_report_service.get_aggregate_report_for_manager(audit_cycle_id)
            response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="' + name + '"'
            return response
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404
