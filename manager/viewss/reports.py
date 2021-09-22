from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from kronos.exceptions import AppLogicError

from manager.service.reports import get_auditor_payment_report, get_billing_report, get_profitability_report, get_project_cost_report, get_monthly_pnl_report

class AuditPaymentReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        report = get_auditor_payment_report(request.GET.get('month',''), request.GET.get('year',''), request.GET.get('payment',''))
        return Response(report)


class BilingReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        billing_report = get_billing_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(billing_report)


class ProfitablityReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        profitability_report = get_profitability_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(profitability_report)


class ProjectCostReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        project_cost_report = get_project_cost_report(request.GET.get('month',''), request.GET.get('year'))
        return Response(project_cost_report)


class MonthlyPNLReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        monthly_pnl_report = get_monthly_pnl_report(request.GET.get('year'))
        return Response(monthly_pnl_report)