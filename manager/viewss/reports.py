from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from kronos.exceptions import AppLogicError

from manager.service.reports import get_auditor_payment_report, get_billing_report, get_profitability_report, get_project_cost_report, get_monthly_pnl_report, get_manager_wise_profitability_report, get_client_wise_profitability_report, get_qa_wise_report, get_follow_up_report

class AuditPaymentReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        report = get_auditor_payment_report(request.GET.get('month',''), request.GET.get('year',''), request.GET.get('payment',''), request.GET.get('client'))
        return Response(report)


class BilingReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        billing_report = get_billing_report(request.GET.get('month',''), request.GET.get('year'), request.GET.get('client'))
        return Response(billing_report)


class ProfitablityReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        profitability_report = get_profitability_report(request.GET.get('month',''), request.GET.get('year'), request.GET.get('client'))
        return Response(profitability_report)


class ProjectCostReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        project_cost_report = get_project_cost_report(request.GET.get('month',''), request.GET.get('year'), request.GET.get('client'))
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


class ManagerWiseProfitabilityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        manager_report = get_manager_wise_profitability_report(request.GET.get('month'), request.GET.get('year'), request.GET.get('manager'))
        return Response(manager_report)


class ClientWiseProfitabilityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        client_report = get_client_wise_profitability_report(request.GET.get('client'), request.GET.get('year'), request.GET.get('last_client_id'))
        return Response(client_report)

class QAWiseReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if not request.user.has_perm('manager.can_view_reports'):
            raise AppLogicError('Permission denied')
        qa_report = get_qa_wise_report(request.GET.get('month'), request.GET.get('year'), request.GET.get('qa'))
        return Response(qa_report)


class FollowUpReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        report = get_follow_up_report(request.GET.get('client'), request.GET.get('cycle'), request.GET.get('store'), request.GET.get('audit_status'), request.GET.get('followup_date'))
        return Response(report)