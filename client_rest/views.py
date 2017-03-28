from django.shortcuts import render
from django.http import HttpResponse, Http404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client.models import Store
from client.service import audit_cycle_aggregation as audit_cycle_aggregation_service
from client.service import store as store_service

from audit_store import service as audit_store_service

from questionnaire.service import section as section_service

from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
import attachment.service as attachment_service

import audit.service.audit_cycle as audit_cycle_service

from client_report.service import xlsx_report as xlsx_report_service
from client_report.service import audit_section

from .serializers import AuditStoreSerializer, StoreSerializer, SectionSerializer, AnswerSerializer, ReportSectionSerializer, AttachmentSerializer, ClientUserSerializer, AuditCycleSerializer

class ClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        return Response(ClientUserSerializer(request.user.clientuser).data)

class AuditStoreLatest(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        audit_stores = audit_store_service.find_latest_for_client(request.user.clientuser.client.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)

class AuditCycleAggregate(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        try:
            audit_cycle_type = request.GET.get('type', None)
            aggregations = audit_cycle_aggregation_service.get_audit_cycle_comparison(request.user.clientuser.client.id, audit_cycle_type)
            return Response(aggregations)
        except ObjectNotFound as e:
            raise NotFound from e


class StoreByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, city_id=None, format=None):
        stores = Store.objects.filter(client_id=request.user.clientuser.client.id, location__city_id=request.GET.get('city_id'))
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


class AttachmentByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            attachments = attachment_service.find_by_audit_store_for_client(audit_store_id, request.user.clientuser.client.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        try:
            report, name = xlsx_report_service.get_xlsx_report(audit_store_id, request.user.clientuser.client.id)
            response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=' + name
            return response
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404


class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        try:
            audit_cycles = audit_cycle_service.find_for_clientuser(request.user.id)
            return Response(AuditCycleSerializer(audit_cycles, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e

class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_CLIENT],
        }
    def get(self, request, format=None):
        try:
            cities = store_service.find_cities_for_clientuser(request.user.id)
            return Response(cities)
        except ObjectNotFound as e:
            raise NotFound from e


class AuditCycleCitySectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        try:
            mean_marks = audit_section.get_city_section_aggregation_for_client(audit_cycle_id, city_id, request.user.clientuser.client_id)
            return Response(mean_marks)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class AuditCycleStoreSectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, store_id, format=None):
        try:
            mean_marks = audit_section.get_store_section_aggregation_for_client(audit_cycle_id, store_id, request.user.clientuser.client_id)
            return Response(mean_marks)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class AuditCycleCityStoreAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        try:
            mean_marks = audit_section.get_store_aggregation_list_for_client(audit_cycle_id, city_id, request.user.clientuser.client_id)
            return Response(mean_marks)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404
