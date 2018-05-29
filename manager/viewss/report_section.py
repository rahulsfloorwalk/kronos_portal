from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from answer.service import report_section as report_section_service
from answer.service import report_section_manager as report_section_manager_service
from ..serializers import ReportSectionSerializer, ReportSectionDeSerializer

class ReportSectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_store_id, format=None):
        report_sections = report_section_service.find_by_audit_store(audit_store_id)
        return Response(ReportSectionSerializer(report_sections, many=True).data)

class PMCommentSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, audit_store_id, section_id, format=None):
        request.data['section'] = section_id
        request.data['audit_store'] = audit_store_id
        ds = ReportSectionDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = ds.validated_data['audit_store']
        pm_comment = ds.validated_data['pm_comment']
        section = ds.validated_data['section']
        report_section = report_section_service.submit_pm_comment(audit_store.id, section.id, pm_comment)
        return Response(ReportSectionSerializer(report_section).data)

class AuditorCommentSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    class DeSerializer(Serializer):
        auditor_comment = CharField()

    def post(self, request, audit_store_id, section_id, format=None):
        ds = AuditorCommentSubmitView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_section = report_section_manager_service.set_auditor_comment_for_manager(audit_store_id, section_id, ds.validated_data["auditor_comment"])
        return Response(ReportSectionSerializer(report_section).data)

class NotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    class DeSerializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, section_id, format=None):
        ds = NotApplicableView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_section = report_section_manager_service.set_not_applicable_for_manager(audit_store_id, section_id, ds.validated_data["not_applicable"])
        return Response(ReportSectionSerializer(report_section).data)
