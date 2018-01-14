from django.conf import settings
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client.service import audit_cycle_aggregation as audit_cycle_aggregation_service
from client.service import store as store_service

from audit_store import service as audit_store_service
from audit_store import service_client as audit_store_client_service

from questionnaire.service import section as section_service

from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
import attachment.service_client as attachment_client_service

import audit.service.audit_cycle as audit_cycle_service

from audit.models import AuditCycle

from client_report.service import ears_xlsx as ears_xlsx_report_service
from client_report.service import xlsx_report as xlsx_report_service
from client_report.service import audit_cycle_xlsx_report as cycle_xlsx_report_service
from client_report.service import audit_section
from client_report.service import city_trends
from client_report.service import store_trends
from client_report.service import audit_cycle
from client_report.service import store_marking as store_marking_service

from social.service import twitter_client
from .serializers import AuditStoreSerializer, StoreSerializer, SectionSerializer, AnswerSerializer
from .serializers import ReportSectionSerializer, AttachmentSerializer, ClientUserSerializer, AuditCycleSerializer
from .serializers import TwitterFeedSerializer, TwitterHandleSerializer

class ClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        return Response(ClientUserSerializer(request.user.clientuser).data)

class AuditStoreLatest(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_stores = audit_store_service.find_latest_for_client(request.user.clientuser.client.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)

class AuditCycleAggregate(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycle_type = request.GET.get('type', None)
        aggregations = audit_cycle_aggregation_service.get_audit_cycle_comparison(request.user.clientuser.client.id, audit_cycle_type)
        return Response(aggregations)


class AuditTypesByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request):
        types = audit_cycle_service.find_distinct_types_for_clientuser(request.user.id)
        return Response(types)


class StoreByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        if request.GET.get('city_id'):
            stores = store_service.find_stores_by_clientuser_and_city(request.user.id, request.GET.get('city_id'))
        else:
            stores = store_service.find_stores_by_clientuser(request.user.id)
        return Response(StoreSerializer(stores, many=True).data)

class StoreById(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, store_id, format=None):
        store = store_service.find_store_by_client_and_id(request.user.clientuser.client.id, store_id)
        return Response(StoreSerializer(store).data)

class MarkingByStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, store_id, format=None):
        audit_type = request.GET.get('audit_type', AuditCycle.WALKIN)
        data = store_marking_service.get_scores_for_store(store_id, request.user.clientuser.client.id, audit_type)
        return Response(data)

class AuditStoreByStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, store_id, format=None):
        audit_stores = audit_store_service.find_by_store_for_client(store_id, request.user.clientuser.client.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)

class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, request.user)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        return Response(audit_stores)

class SectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        sections = section_service.find_by_audit_store_for_clientuser(audit_store_id, request.user)
        return Response(SectionSerializer(sections, many=True).data)

class AnswerByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store_for_clientuser(audit_store_id, request.user)
        return Response(AnswerSerializer(answers, many=True).data)

class ReportSectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        report_sections = report_section_service.find_by_audit_store_for_clientuser(audit_store_id, request.user)
        return Response(ReportSectionSerializer(report_sections, many=True).data)

class AttachmentByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        attachments = attachment_client_service.find_by_audit_store_for_clientuser(audit_store_id, request.user)
        return Response(AttachmentSerializer(attachments, many=True).data)

class AttachmentByReportSection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, section_id, format=None):
        attachments = attachment_client_service.find_by_audit_store_and_section_for_client(audit_store_id, section_id, request.user.clientuser.client.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

class AuditStoreXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        report, name = xlsx_report_service.get_xlsx_report(audit_store_id, request.user.clientuser.client.id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditCycleXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        report, name = cycle_xlsx_report_service.get_aggregate_report_for_clientuser(audit_cycle_id, request.user.id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditCycleFilteredXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        filters = {}
        filters['city'] = request.GET.get('city')
        filters['type'] = request.GET.get('type')
        filters['priority'] = request.GET.get('priority')
        report, name = cycle_xlsx_report_service.get_aggregate_report_with_filters(audit_cycle_id, request.user.id, filters)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditStoreEARSReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        report, name = ears_xlsx_report_service.generate_ears_report_for_clientuser(audit_store_id, request.user)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycles = audit_cycle_service.find_for_clientuser(request.user.id)
        return Response(audit_cycles)

class AuditCycleByTypeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_type, format=None):
        audit_cycles = audit_cycle_service.find_by_audit_type_for_clientuser(audit_type, request.user.id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        cities = store_service.find_cities_for_clientuser(request.user.id)
        return Response(cities)

class AuditCycleCitySectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        mean_marks = audit_section.get_city_section_aggregation_for_client(audit_cycle_id, city_id, request.user.clientuser.client_id)
        return Response(mean_marks)

class AuditCycleStoreSectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, store_id, format=None):
        mean_marks = audit_section.get_store_section_aggregation_for_client(audit_cycle_id, store_id, request.user.clientuser.client_id)
        return Response(mean_marks)

class AuditCycleCityStoreAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        mean_marks = audit_section.get_store_aggregation_list_for_client(audit_cycle_id, city_id, request.user.clientuser.client_id)
        return Response(mean_marks)

class AuditCycleCityAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        mean_marks = audit_section.get_city_aggregation_for_client(audit_cycle_id, request.user.clientuser.client_id)
        return Response(mean_marks)

class AuditCycleAuditStoreSectionReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, store_id, format=None):
        mean_marks = audit_section.get_audit_store_section_list_for_client(audit_cycle_id, store_id, request.user.clientuser.client_id)
        return Response(mean_marks)

class AuditCycleCityPerformance(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        data = city_trends.get_performing_cities(audit_cycle_id, request.user.id)
        return Response(data)

class AuditCycleStorePerformance(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        data = store_trends.get_performing_stores(audit_cycle_id, request.user.id)
        return Response(data)


class DashboardStoreTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        data = store_trends.get_performing_stores_by_type_for_clientuser(request.GET.get('audit_type',AuditCycle.WALKIN), request.user.id)
        return Response(data)

class DashboardCityWiseTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        data = city_trends.get_performing_cities_by_type_for_clientuser(request.GET.get('audit_type',AuditCycle.WALKIN), request.user.id)
        return Response(data)

class DashboardStoreTrendsXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        data = store_trends.get_performing_stores_by_type_for_clientuser(request.GET.get('audit_type',AuditCycle.WALKIN), request.user.id)
        response_data=store_trends.get_excel_report(data)
        return Response(response_data)

class DashboardCityWiseTrendsXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        data = city_trends.get_performing_cities_by_type_for_clientuser(request.GET.get('audit_type',AuditCycle.WALKIN), request.user.id)
        response_data = city_trends.get_excel_report(data)
        return Response(response_data)

class AuditStoreUpcoming(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_stores = audit_store_client_service.find_upcoming_for_client(request.user.clientuser.client_id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)

class AuditCycleTimeSeriesReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycle_time_series = audit_cycle.get_audit_cycle_section_averages_for_client(request.user.clientuser.client_id, request.GET.get('audit_type',AuditCycle.WALKIN))
        return Response(audit_cycle_time_series)

class AuditCycleTimeSeriesReportXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        data = audit_cycle.get_audit_cycle_section_averages_for_client(request.user.clientuser.client_id, request.GET.get('audit_type',AuditCycle.WALKIN))
        audit_cycle_time_series = audit_cycle.get_excel_report(data)
        return Response(audit_cycle_time_series)

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        return Response({
            "RHEA_PROTOCOL": settings.RHEA_PROTOCOL,
            "RHEA_DOMAIN": settings.RHEA_DOMAIN,
            "RHEA_BASE_URL": settings.RHEA_BASE_URL,
            "BRAND_NAME": settings.BRAND_NAME,
            "BRAND_SHORTNAME": settings.BRAND_SHORTNAME,
            **settings.FRONTEND_CONFIG["CLIENT"],
            **settings.FRONTEND_CONFIG["COMMON"],
        })
        return Response(settings.FRONTEND_CONFIG["CLIENT"])


class TwitterHandlesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        handles = twitter_client.get_handles_for_client(request.user.clientuser.client_id)
        return Response(TwitterHandleSerializer(handles, many=True).data)

class TwitterFeedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, twitter_handle_id, format=None):
        twitter_feeds = twitter_client.get_feeds_for_client_and_handle(request.user.clientuser.client_id, twitter_handle_id)
        return Response(TwitterFeedSerializer(twitter_feeds, many=True).data)
