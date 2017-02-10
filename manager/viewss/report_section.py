from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from answer.service import report_section as report_section_service
from answer.models import Answer
from ..serializers import AnswerSerializer, ReportSectionSerializer, ReportSectionDeSerializer

class ReportSectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            report_sections = report_section_service.find_by_audit_store(audit_store_id)
            return Response(ReportSectionSerializer(report_sections, many=True).data)
        except ObjectNotFound:
            raise NotFound

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
        try:
            report_section = report_section_service.submit_pm_comment(audit_store.id, section.id, pm_comment)
            return Response(ReportSectionSerializer(report_section).data)
        except ObjectNotFound:
            raise NotFound
