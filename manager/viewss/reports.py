from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.service.reports import get_auditor_payment_report, get_billing_report, get_profitability_report, get_project_cost_report

class AuditPaymentReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        report = get_auditor_payment_report(request.GET.get('month',''), request.GET.get('year',''), request.GET.get('payment',''))
        return Response(report)


class BilingReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        billing_report = get_billing_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(billing_report)


class ProfitablityReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        profitability_report = get_profitability_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(profitability_report)


class ProjectCostReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        project_cost_report = get_project_cost_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(project_cost_report)