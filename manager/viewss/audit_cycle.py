from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit.service import audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from auditor.service import application_service
from questionnaire.service import questionnaire as questionnaire_service
from manager.serializers import AuditCycleSerializer, AuditCycleDeSerializer

from client_report.service import audit_cycle_xlsx_report as xlsx_report_service

class AuditCycleViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        audit_cycles = audit_cycle_service.find_audit_cycles_by_client(client_id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data)
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
        return Response(AuditCycleSerializer(audit_cycle).data)

    def post(self, request, audit_cycle_id):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data, context={'id': audit_cycle_id})
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

    def delete(self, request, audit_cycle_id):
        audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
        audit_cycle.delete()
        return Response(AuditCycleSerializer(audit_cycle).data)


class AuditCycleIdPostApprovalDescriptionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    class DeSerializer(Serializer):
        post_approval_description = CharField(allow_blank=True, max_length=4096)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_cycle = audit_cycle_service.set_post_approval_description(audit_cycle_id, ds.validated_data["post_approval_description"])
        return Response(AuditCycleSerializer(saved_audit_cycle).data)


class AuditCycleXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        report, name = xlsx_report_service.get_aggregate_report_for_manager(audit_cycle_id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class ExportQuestionnaire(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        report, name = questionnaire_service.export_questionnaire(audit_cycle_id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditCycleDashboard(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        return Response(audit_cycle_service.get_audit_cycle_dashboard())


class AuditCycleRejectAllApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_cycle_id):
        rejected_applications = application_service.reject_all_applications_for_audit_cycle(audit_cycle_id, request.user)
        return Response(len(rejected_applications))


class AuditCycleApplicationStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        stats = application_service.get_application_stats(audit_cycle_id)
        return Response(stats)


class AuditCycleAuditStoreStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        stats = audit_store_service.get_audit_store_stats(audit_cycle_id)
        return Response(stats)
