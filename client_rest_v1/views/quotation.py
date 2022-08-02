from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client_rest_v1.serializers import AuditCycleWithQuotationSerializer, QuotationPlainSerializer, QuotationSerializer

from client_rest_v1.services import quotation as quotation_service
from audit.service import audit_cycle as audit_cycle_service
from kronos.utils import get_audit_category_list, get_audit_type_list, get_industry_list


class QuotationIndustryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        industry = get_industry_list()
        return Response(industry)


class QuotationAuditCategoryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        audit_category = get_audit_category_list()
        return Response(audit_category)


class QuotationAuditTypeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        audit_type = get_audit_type_list()
        return Response(audit_type)


class QuotationPreviewView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
    }

    def post(self, request):
        quotation = quotation_service.get_quotation_preview_data(request.data)
        return Response(quotation)


class QuotationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
    }

    def post(self, request, client_id):
        ds = QuotationPlainSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        quotation = quotation_service.insert_quotation_data(client_id, request.data)
        return Response(QuotationPlainSerializer(quotation).data)


class QuotationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, quotation_id):
        quotation = quotation_service.find_by_id(quotation_id)
        return Response(QuotationSerializer(quotation).data)


class QuotationUncompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, client_id):
        quotation = quotation_service.find_uncomplete_by_client_id(client_id)
        return Response(QuotationSerializer(quotation).data)


class AuditCycleByQuotationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, quotation_id):
        audit_cycle = audit_cycle_service.find_by_quotation_id(quotation_id)
        return Response(AuditCycleWithQuotationSerializer(audit_cycle).data)