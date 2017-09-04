from django.contrib.auth.models import User, Group
from django.http import HttpResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, Serializer, DateField, CharField
from rest_framework import generics

from rest_framework.filters import SearchFilter

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle
from audit.service import audit_cycle as audit_cycle_service
from payment.service import payment_manager as payment_service
from questionnaire.service import questionnaire as questionnaire_service
from manager.serializers import AuditCycleSerializer, AuditCycleDeSerializer
from manager.serializers import PaymentUserSerializer

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


class AuditCycleIdPostApprovalDescriptionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
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

class AuditCycleStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audit_cycle_stats = audit_cycle_service.get_audit_cycle_stats(audit_cycle_id)
            return Response(audit_cycle_stats)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class ExportQuestionnaire(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            report, name = questionnaire_service.export_questionnaire(audit_cycle_id)
            response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="' + name + '"'
            return response
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class AuditCycleDashboard(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        try:
            audit_cycles = audit_cycle_service.get_audit_cycle_dashboard()
            response  = []
            for audit_cycle in audit_cycles:
                obj = {}
                obj['id'] = audit_cycle.id
                obj['name'] = audit_cycle.name
                obj['status'] = audit_cycle.status
                obj['client'] = audit_cycle.client.name
                obj['start_date'] = audit_cycle.start_date
                obj['end_date'] = audit_cycle.end_date
                obj['stats'] = audit_cycle_service.get_audit_cycle_stats(audit_cycle.id)
                response.append(obj)
            return Response(response)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            payments = payment_service.find_by_audit_cycle(audit_cycle_id)
            return Response(PaymentUserSerializer(payments, many=True).data)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class PendingPaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            payments = payment_service.find_pending_by_audit_cycle(audit_cycle_id)
            return Response(PaymentUserSerializer(payments, many=True).data)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class PendingPaymentCsvView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        data, filename = payment_service.find_pending_csv_for_audit_cycle(audit_cycle_id)
        response = HttpResponse(data.read(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="' + filename + '"'
        return response
