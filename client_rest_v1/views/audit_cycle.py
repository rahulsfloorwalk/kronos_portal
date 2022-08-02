from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.fields import CharField

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from auditor.service import application_service
from questionnaire.service import questionnaire as questionnaire_service
from audit.service import audit_cycle as audit_cycle_service
from client.service import client_service

from ..serializers import AuditCycleSerializer, AuditCycleDeSerializer, AuditCycleWithQuotationSerializer

# Create your views here.


class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        audit_cycles = audit_cycle_service.find_audit_cycles_by_client(client.id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

    def post(self, request):
        audit_cycle_ds = AuditCycleWithQuotationSerializer(data=request.data)
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)


class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
        'DELETE': [GROUP_NAME_CLIENT]
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
        return Response(status=204)


class AuditCycleDashboardView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        audit_cycles = audit_cycle_service.get_audit_cycle_dashboard_by_client(client.id)
        return Response(audit_cycles)


class AuditCycleDashboardSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        summary = audit_cycle_service.get_audit_cycle_dashboard_summary_by_client(client.id)
        return Response(summary)


class AuditCycleIdPostApprovalDescriptionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
        'DELETE': [GROUP_NAME_CLIENT]
    }
    class DeSerializer(Serializer):
        post_approval_description = CharField(allow_blank=True, max_length=16384)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_cycle = audit_cycle_service.set_post_approval_description(audit_cycle_id, ds.validated_data["post_approval_description"])
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

class AuditCycleIdCheckPointsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
    }

    class DeSerializer(Serializer):
        checkpoints = CharField(allow_blank=True, max_length=20480)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_service.set_checkpoints(audit_cycle_id, ds.validated_data['checkpoints'])
        return Response(AuditCycleSerializer(audit_cycle).data)


class AuditAlignmentFactors(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
    }
    def post(self, request, audit_cycle_id, format=None):
        audit_cycles = audit_cycle_service.set_audit_alignment_factor_by_audit_cycle(audit_cycle_id, request.data)
        return Response(AuditCycleSerializer(audit_cycles).data)


class AuditDetailsCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }

    def post(self, request, to_audit_cycle_id):
        audit_cycle = audit_cycle_service.copy_audit_details_from_to(request.data.get("from_audit_cycle_id"),
                                                                     to_audit_cycle_id,
                                                                     request.data.get("checkpoints"),
                                                                     request.data.get("post_approval_desc"),
                                                                     request.data.get("proof_tags"),
                                                                     request.data.get("audit_alignment_factors"))
        return Response(AuditCycleSerializer(audit_cycle).data)


class ExportQuestionnaire(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        report, name = questionnaire_service.export_questionnaire(audit_cycle_id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response


class AuditCycleApplicationStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id):
        stats = application_service.get_application_stats(audit_cycle_id)
        return Response(stats)