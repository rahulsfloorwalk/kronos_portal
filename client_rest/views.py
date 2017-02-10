from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client.models import Store

from audit_store import service as audit_store_service

from questionnaire.service import section as section_service

from answer.service import answer as answer_service
from answer.service import report_section as report_section_service

from .serializers import AuditStoreSerializer, StoreSerializer, SectionSerializer, AnswerSerializer, ReportSectionSerializer

class AuditStoreLatest(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        audit_stores = audit_store_service.find_latest_for_client(request.user.clientuser.client.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)


class StoreByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        stores = Store.objects.filter(client_id=request.user.clientuser.client.id)
        return Response(StoreSerializer(stores, many=True).data)

class StoreById(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, store_id, format=None):
        try:
            store = Store.objects.get(id=store_id, client_id=request.user.clientuser.client.id)
            return Response(StoreSerializer(store).data)
        except Store.DoesNotExist as e:
            raise NotFound from e


class AuditStoreByStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, store_id, format=None):
        audit_stores = audit_store_service.find_by_store_for_client(store_id, request.user.clientuser.client.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)

class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            audit_store = audit_store_service.find_by_id_for_client(audit_store_id, request.user.clientuser.client.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e

class SectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            sections = section_service.find_by_audit_store_for_client(audit_store_id, request.user.clientuser.client.id)
            return Response(SectionSerializer(sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e


class AnswerByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            answers = answer_service.find_by_audit_store_for_client(audit_store_id, request.user.clientuser.client.id)
            return Response(AnswerSerializer(answers, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e


class ReportSectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            report_sections = report_section_service.find_by_audit_store_for_client(audit_store_id, request.user.clientuser.client.id)
            return Response(ReportSectionSerializer(report_sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e
