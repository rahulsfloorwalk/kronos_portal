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
from questionnaire.service import questionnaire_type_client_service

from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
import attachment.service_client as attachment_client_service

import audit.service.audit_cycle as audit_cycle_service
from audit.service import audit_cycle_client_service
from audit.service import report_attribute_client_service
from audit.service import audit_cycle_proof_tag

from client.service import client_service

from client_report.service import ears_xlsx as ears_xlsx_report_service
from client_report.service import xlsx_report as xlsx_report_service
from client_report.service import all_stores_xlsx as all_stores_xlsx_report_service
from client_report.service import audit_cycle_xlsx_report as cycle_xlsx_report_service
from client_report.service import report_browser_xlsx as report_browser_xlsx_service
from client_report.service import audit_section
from client_report.service import cluster_trends
from client_report.service import region_trends
from client_report.service import city_trends
from client_report.service import store_trends
from client_report.service import audit_cycle
from client_report.service import store_marking as store_marking_service

from social.service import twitter_client
from .serializers import AuditStoreSerializer, StoreSerializer, SectionSerializer, AnswerSerializer, CitySerializer
from .serializers import ReportSectionSerializer, AttachmentSerializer, ClientUserSerializer, AuditCycleSerializer
from .serializers import TwitterFeedSerializer, TwitterHandleSerializer
from .serializers import ReportAttributeSerializer
from .serializers import AuditCycleProoftagListSerializer
from .serializers import AuditCycleScoreSerializer
from .serializers import ClientSerializer
from .serializers import ReportActionPlanSerializer
from client_report.service import improvable_questions
from client_report.service import questionnaire_survey

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
        # if request.GET.get('city_id'):
        #     stores = store_service.find_stores_by_clientuser_and_city(request.user.id, request.GET.get('city_id'))
        # else:
        stores, cities_list, store_count = store_service.find_stores_by_clientuser(request.user.id,
                                                                                   request.GET.get('lastStoreId'))
        return Response({'stores_list': StoreSerializer(stores, many=True).data,
                         'city_list': CitySerializer(cities_list, many=True).data, 'store_count': store_count})


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
    def get(self, request, questionnaire_type_id, store_id, format=None):
        data = store_marking_service.get_scores_for_store_by_questionnaire_type(store_id, request.user.clientuser.client.id, questionnaire_type_id)
        return Response(data)

class MarkingGraphByStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, store_id, format=None):
        data = store_marking_service.get_scores_graph_for_store_by_questionnaire_type(store_id, request.user.clientuser.client.id, questionnaire_type_id)
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


class AuditStoreReportActionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }

    def get(self, request, audit_store_id):
        audit_report_action = audit_store_client_service.get_audit_store_action_plan(audit_store_id)
        return Response(ReportActionPlanSerializer(audit_report_action, many=True).data)

    def post(self, request, audit_store_id):
        audit_report_action = audit_store_client_service\
            .submit_audit_store_action_plan(audit_store_id, request.user.clientuser, request.data['action_plan'], request.data['target_date'],
                                            request.data['person'])
        return Response(ReportActionPlanSerializer(audit_report_action).data)


class ActionReportsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, audit_cycle_id):
        reports_action = audit_store_client_service.get_reports_action_plan(request.user.clientuser, audit_cycle_id)
        return Response(ReportActionPlanSerializer(reports_action, many=True).data)


class ActionReportsXlsxView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, audit_cycle_id):
        report_action, name = audit_store_client_service.get_reports_action_plan_xlsx(request.user.clientuser, audit_cycle_id)
        response = HttpResponse(report_action.read(),
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response


class ActionReportChangeStatus(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, action_plan_id):
        report_action = audit_store_client_service.change_status_report_action(action_plan_id)
        return Response(ReportActionPlanSerializer(report_action).data)


class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        return Response(audit_stores)


class ImpactFactorByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        impact_factors = audit_store_client_service.find_impact_factors_by_id_for_clientuser(audit_store_id, request.user)
        return Response(impact_factors)


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


class AuditCycleYearList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        audit_cycle_year_data = audit_cycle_client_service.get_audit_cycle_year_list(request.user.id)
        return Response(audit_cycle_year_data)

class AuditStoreXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        report, name = xlsx_report_service.get_xlsx_report_for_clientuser(audit_store_id, request.user)
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
        filters['state'] = request.GET.get('state')
        filters['country'] = request.GET.get('country')
        filters['type'] = request.GET.get('type')
        filters['priority'] = request.GET.get('priority')
        filters['month'] = request.GET.get('month')
        filters['start_date'] = request.GET.get('start_date')
        filters['end_date'] = request.GET.get('end_date')
        filters['attribute'] = request.GET.getlist('attribute')
        report, name = cycle_xlsx_report_service.get_aggregate_report_with_filters(audit_cycle_id, request.user.id, filters)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class ReportBrowserFilteredXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        filters = {}
        filters['city'] = request.GET.get('city')
        filters['state'] = request.GET.get('state')
        filters['country'] = request.GET.get('country')
        filters['type'] = request.GET.get('type')
        filters['priority'] = request.GET.get('priority')
        filters['month'] = request.GET.get('month')
        filters['start_date'] = request.GET.get('start_date')
        filters['end_date'] = request.GET.get('end_date')
        filters['attribute'] = request.GET.getlist('attribute')
        report, name = report_browser_xlsx_service.get_aggregate_report_with_filters(audit_cycle_id, request.user.id, filters)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AllStoresAuditCycleWiseXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request):
        year = request.GET.get('year')
        report, name = all_stores_xlsx_report_service.generate_all_stores_audit_cycle_wise_report_for_clientuser(request.user.id, year)
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
        audit_cycles = audit_cycle_client_service.find_all_for_clientuser(request.user.id)
        return Response(audit_cycles)

class AuditCycleForDashboardView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycles = audit_cycle_client_service.find_all_for_dashboard_clientuser(request.user.id)
        return Response(audit_cycles)

class ReportAttributeByAuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        report_attributes = report_attribute_client_service.find_report_attributes_by_audit_cycle_id_for_client(audit_cycle_id, request.user.id)
        return Response(ReportAttributeSerializer(report_attributes, many=True).data)

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
    def get(self, request, questionnaire_type_id, format=None):
        data = store_trends.get_performing_stores_by_type_for_clientuser(questionnaire_type_id, request.user.id)
        return Response(data)

class DashboardStoreTrendsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        data = store_trends.get_performing_stores_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, request.user.id)
        return Response(data)

class DashboardCityWiseTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, format=None):
        data = city_trends.get_performing_cities_by_type_for_clientuser(questionnaire_type_id, request.user.id)
        return Response(data)


class DashboardCityWiseTrendsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        data = city_trends.get_performing_cities_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, request.user.id)
        return Response(data)


class DashboardRegionWiseTrendsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        data = region_trends.get_performing_regions_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, request.user.id)
        return Response(data)


class DashboardClusterWiseTrendsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        data = cluster_trends.get_performing_clusters_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, request.user.id)
        return Response(data)



class DashboardStoreTrendsXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, format=None):
        data = store_trends.get_performing_stores_by_type_for_clientuser(questionnaire_type_id, request.user.id)
        response_data=store_trends.get_excel_report(data)
        return Response(response_data)

class DashboardCityWiseTrendsXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, format=None):
        data = city_trends.get_performing_cities_by_type_for_clientuser(questionnaire_type_id, request.user.id)
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
    def get(self, request, questionnaire_type_id, format=None):
        audit_cycle_time_series = audit_cycle.get_audit_cycle_section_averages_for_client(request.user, questionnaire_type_id)
        return Response(audit_cycle_time_series)

class AuditCycleTimeSeriesReportByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        audit_cycle_time_series = audit_cycle.get_audit_cycle_section_averages_for_client_by_audit_cycle_id(audit_cycle_id, questionnaire_type_id, request.user.id)
        return Response(audit_cycle_time_series)


class ImprovableQuestionsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id):
        audit_cycle_improvable_questions = improvable_questions.get_improvable_questions_by_audit_cycle(audit_cycle_id, questionnaire_type_id, request.user.clientuser)
        return Response(audit_cycle_improvable_questions)


class ImprovableQuestionsXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request):
        audit_cycle_id = request.GET.get('auditCycleId')
        questionnaire_type_id = request.GET.get('questionnaireTypeId')
        report, name = improvable_questions.get_improvable_questions_xlsx_by_audit_cycle(audit_cycle_id, questionnaire_type_id, request.user.clientuser)
        response = HttpResponse(report.read(),
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response


class QuestionnaireSurveyByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id):
        audit_cycle_questionnaire_survey = questionnaire_survey.get_questionnaire_survey_by_audit_cycle(audit_cycle_id, questionnaire_type_id, request.user.clientuser)
        return Response(audit_cycle_questionnaire_survey)


class QuestionnaireSurveyXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request):
        audit_cycle_id = request.GET.get('auditCycleId')
        questionnaire_type_id = request.GET.get('questionnaireTypeId')
        report, name = questionnaire_survey.get_questionnaire_survey_xlsx_by_audit_cycle(audit_cycle_id,
                                                                                         questionnaire_type_id,
                                                                                         request.user.clientuser)
        response = HttpResponse(report.read(),
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response


class AuditCycleTimeSeriesReportXlsx(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, format=None):
        data = audit_cycle.get_audit_cycle_section_averages_for_client(request.user, questionnaire_type_id)
        audit_cycle_time_series = audit_cycle.get_excel_report(data)
        return Response(audit_cycle_time_series)

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        return Response({
            "USER_ID": request.user.id,
            "USER_EMAIL": request.user.email,
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

class QuestionnaireTypesByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request):
        types = questionnaire_type_client_service.find_questionnaire_types_for_client_by_user(request.user)
        return Response(types)

class StoreQuestionnaireTypesList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, store_id):
        types = questionnaire_type_client_service.find_questionnaire_types_for_client_store_by_user(request.user, store_id)
        return Response(types)

class QuestionnaireTypesForDashboardByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request):
        types = questionnaire_type_client_service.find_questionnaire_types_for_client_dashboard_by_user(request.user)
        return Response(types)


class QuestionnaireTypesListForProofComparison(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, store_id):
        types = questionnaire_type_client_service.find_questionnaire_types_for_proof_comparison(store_id)
        return Response(types)


class StorePerformanceView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request):
        store_performance_data = section_service.get_store_performance_data(request.data["percentage"],
                                                                            request.data["questionnaire_id"])
        return Response(store_performance_data)


class StorePerformanceStoreListByPercentageView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request):
        store_list = section_service.get_store_performance_store_list(
            request.data['audit_cycle_id'],
            request.data['section_id'],
            request.data['percentage']
        )
        return Response(store_list)


class ProofTagListByStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, store_id):
        proof_tags = audit_cycle_proof_tag.find_proof_tags_by_store(store_id, None)
        return Response(AuditCycleProoftagListSerializer(proof_tags, many=True).data)


class ProofTagListByQuestionnaireType(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request, store_id):
        proof_tags = audit_cycle_proof_tag.find_proof_tags_by_store(store_id, request.data['questionnaireTypeId'])
        return Response(AuditCycleProoftagListSerializer(proof_tags, many=True).data)


class ProofsByTag(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request, store_id):
        audit_cycle_list = audit_cycle_proof_tag.get_audit_cycle_list_by_store(store_id, request.data['questionnaireTypeId'])
        proof_tag_id = audit_cycle_proof_tag.get_master_proof_tag_id_from_audit_cycle_proof_tag(request.data['proof_tag_id'])
        attachment = attachment_client_service.get_attachment_by_proof_tag(store_id, audit_cycle_list, proof_tag_id)
        return Response(attachment)


class AuditCycleScore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }

    def get(self, request, questionnaire_type_id):
        audit_cycle_list = audit_cycle_client_service.get_audit_cycle_score(questionnaire_type_id, request.user.id)
        return Response(AuditCycleScoreSerializer(audit_cycle_list, many=True).data)


class StoreFilter(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request):
        stores = store_service.find_filter_stores_by_clientuser(request.user.id, request.data['store_code'].strip(),
                                                                request.data['selected_city'],
                                                                request.data['percent_from'],
                                                                request.data['percent_to'])
        return Response(StoreSerializer(stores, many=True).data)


class EmailNotification(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self, request):
        client = client_service.find_client_by_id(request.user.clientuser.client.id)
        return Response(ClientSerializer(client).data)

    def post(self, request):
        client_user = client_service.update_receive_email_notification(request.user.clientuser.client.id,
                                                                       request.data['receive_email_notification'])
        return Response(ClientSerializer(client_user).data)


class AuditFeedbackReportMail(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST':[GROUP_NAME_CLIENT],
    }
    def post(self, request):
        audit_store = audit_store_client_service.audit_feedback_report_mail(request.data['email_receiver_list'], request.data['audit_store_id'], request.data['audit_report'], request.user)
        return Response(AuditStoreSerializer(audit_store).data)