from django.conf import settings
from django.http import HttpResponse
from rest_framework.permissions import AllowAny

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client.service import audit_cycle_aggregation as audit_cycle_aggregation_service
from client.service import store as store_service
from client.service import store_import_xlsx
from manager.serializers import StoreSerializer, StoreImportDeSerializer
from client.service.store_import_xlsx import find_sample_xlsx_for_store_insert, import_store_by_xlsx_sheet


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
from .serializers import AuditStoreSerializer, StoreSerializer, SectionSerializer,QuestionsAnswerSerializer, AnswerSerializer, CitySerializer, SentimentDataSerializer,AuditStoreKeywordAnalysisSerializer
from .serializers import ReportSectionSerializer, AttachmentSerializer, ClientUserSerializer, AuditCycleSerializer
from .serializers import TwitterFeedSerializer, TwitterHandleSerializer
from .serializers import ReportAttributeSerializer
from .serializers import AuditCycleProoftagListSerializer
from .serializers import AuditCycleScoreSerializer
from .serializers import ClientSerializer
from .serializers import ReportActionPlanSerializer
from client_report.service import improvable_questions
from client_report.service import questionnaire_survey
from django.db.transaction import atomic

import json
from django.http import JsonResponse
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from audit_store.models import AuditStore
from audit_store.service_manager import get_sentiment_data

class ClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        return Response(ClientUserSerializer(request.user.clientuser).data)

class AdminAndNonAdminClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    request_groups={
        'GET':[GROUP_NAME_CLIENT],
    }
    def get(self,request,audit_store_id,format=None):
        client_users = client_service.find_client_user_by_audit_store_id(audit_store_id)
        return Response(client_users)

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

class KeyWordAnalysisByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        audit_stores = store_marking_service.get_keyword_analysis_for_store_by_questionnaire_type(audit_cycle_id, request.user.clientuser.client.id, questionnaire_type_id)
        return Response(audit_stores)

class AuditCycleListByQuestionnaireType(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id):
        cleint_id = request.user.clientuser.client.id
        audit_cycle_list = store_marking_service.find_audit_cycle_list_by_questionnaire_types(cleint_id, questionnaire_type_id)
        return Response(audit_cycle_list)

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
    @atomic
    def post(self, request, audit_store_id):
        audit_report_action = audit_store_client_service\
            .submit_audit_store_action_plan(request.user.clientuser.full_name,audit_store_id, request.user.clientuser, request.data['action_plan'], request.data['target_date'],
                                            request.data['person'])
        return Response(ReportActionPlanSerializer(audit_report_action).data)


class SectionByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id):
        sections = section_service.get_sections_by_audit_cycle( audit_cycle_id,request.user.id)
        formatted_sections = [
            {"id": section["id"], "name": section["name"]}
            for section in sections
        ]
        return Response(formatted_sections)

class QuestionsBySection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self, request, section_id):
        questions = section_service.get_questions_by_section_for_client(section_id, request.user.id)
        formatted_questions = [{"id": question["id"], "name": question["question_txt"]} for question in questions]
        
        return Response(formatted_questions) 

class QuestionById(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }

    def post(self, request):
        question_ids = request.data.get("question_ids", "[]")
        store_ids = request.data.get("store_ids", "[]")

        try:
            if isinstance(question_ids, str):
                question_ids = json.loads(question_ids)
            question_ids = list(map(int, question_ids))
        except (json.JSONDecodeError, ValueError, TypeError):
            return Response({"error": "Invalid question_ids format"}, status=400)

        try:
            if isinstance(store_ids, str):
                store_ids = json.loads(store_ids)
            store_ids = list(map(int, store_ids)) if store_ids else None
        except (json.JSONDecodeError, ValueError, TypeError):
            return Response({"error": "Invalid store_ids format"}, status=400)

        answers = section_service.get_question_by_id_for_client(question_ids, request.user.id, store_ids)
        return Response(QuestionsAnswerSerializer(answers, many=True).data)


    
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

class AuditStoreIDView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        return Response(audit_stores)
    
class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, format=None):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(",") if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        audit_stores = audit_section.get_audit_store_aggregation_for_clients(audit_cycle_ids, request.user.id)
        return Response(audit_stores)

class AuditCycleAuditStoreSectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycle_ids = request.GET.get("audit_cycle_ids")
        if not audit_cycle_ids:
            return Response({"error": "audit_cycle_ids is required."},status=400)
        try:
            audit_cycle_ids = [ int(x.strip()) for x in audit_cycle_ids.split(",") if x.strip()]
        except ValueError:
            return Response({"error": "Invalid audit_cycle_ids."},status=400)

        data = audit_section.get_audit_stores_sections_aggregation_for_client( audit_cycle_ids,request.user.id)
        return Response(data)

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
        sections = section_service.find_by_audit_store_for_client_clientuser(audit_store_id, request.user)
        return Response(SectionSerializer(sections, many=True).data)

class AnswerByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store_for_client_clientuser(audit_store_id, request.user)
        return Response(AnswerSerializer(answers, many=True).data)

class ReportSectionByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_store_id, format=None):
        report_sections = report_section_service.find_by_audit_store_for_client_clientuser(audit_store_id, request.user)
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

class QuiestionsFilteredXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, format=None):
        question_ids = request.query_params.getlist("question_ids")
        store_ids = request.query_params.getlist("store_ids")

        if not question_ids:
            question_ids = []
        if not store_ids:
            store_ids = []

        questions, answers,store_ids = report_browser_xlsx_service.get_aggregate_questions_data_with_filters_for_client(question_ids,store_ids)
        # excel_data = report_browser_xlsx_service.create_questions_text_structure(questions, audit_stores)
        output = report_browser_xlsx_service.write_questions_data(questions, answers, store_ids)

        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Store_Report.xlsx"'
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

class AuditCycleForNPSView(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        audit_cycles = audit_cycle_client_service.find_all_for_nps_clientuser(request.user.id)
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
        audit_cycles = audit_cycle_service.find_by_audit_type_for_client_clientuser(audit_type, request.user.id)
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


class DashboardStoresTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, format=None):
        data = store_trends.get_performing_stores_by_type_for_clientuser(questionnaire_type_id, request.user.id)
        return Response(data)

class DashboardStoreTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {'GET': [GROUP_NAME_CLIENT]}
    def get(self, request, questionnaire_type_id, format=None):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(',') if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        data = store_trends.get_store_performance_range_wise_for_clientuser(questionnaire_type_id, audit_cycle_ids, request.user.id)
        return Response(data)

class DashboardStoreTrendsByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, questionnaire_type_id, audit_cycle_id, format=None):
        data = store_trends.get_performing_stores_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, request.user.id)
        return Response(data)

# class DashboardCityWiseTrends(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'GET': [GROUP_NAME_CLIENT],
#     }
#     def get(self, request, questionnaire_type_id, format=None):
#         data = city_trends.get_performing_cities_by_type_for_clientuser(questionnaire_type_id, request.user.id)
#         return Response(data)

class DashboardCityWiseTrends(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {'GET': [GROUP_NAME_CLIENT]}
    def get(self, request, questionnaire_type_id, format=None):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(',') if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        data = city_trends.get_city_performance_range_wise_for_clientuser(questionnaire_type_id,audit_cycle_ids,request.user.id)
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
    
# class AuditStoreUpcoming(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'GET': [GROUP_NAME_CLIENT],
#     }
#     def get(self, request, format=None):
#         client_id = request.user.clientuser.client_id
#            # /audit_store/upcoming?audit_cycle_ids=101,102,103
#         audit_cycle_ids = request.GET.get('audit_cycle_ids')
#         if audit_cycle_ids:
#             try:
#                 audit_cycle_ids = [
#                     int(cycle_id)
#                     for cycle_id in audit_cycle_ids.split(',')
#                     if cycle_id.strip()
#                 ]
#             except ValueError:
#                 return Response({'detail': 'Invalid audit_cycle_ids.'}, status=400)
#         else:
#             audit_cycle_ids = None
#         audit_stores = audit_store_client_service.find_upcoming_for_client(client_id=client_id,audit_cycle_ids=audit_cycle_ids)
#         return Response( AuditStoreSerializer(audit_stores, many=True).data)
    
class AuditCycleTimeSeriesReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {'GET': [GROUP_NAME_CLIENT]}
    def get(self, request, questionnaire_type_id, format=None):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if audit_cycle_ids:
            try:
                audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(',') if i.strip()]
            except ValueError:
                return Response({"message":"Invalid audit_cycle_ids."}, status=400)
        else:
            audit_cycle_ids = None
        data = audit_cycle.get_audit_cycle_section_averages_for_client(request.user, questionnaire_type_id, audit_cycle_ids)
        return Response(data)

class AuditCycleTimeSeriesReportByAuditCycleId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, questionnaire_type_id, format=None):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(",") if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        audit_cycle_time_series = audit_cycle.get_audit_cycle_section_averages_for_client_by_audit_cycle_id(
            audit_cycle_ids,
            questionnaire_type_id,
            request.user.id
        )
        return Response(audit_cycle_time_series)


class ImprovableQuestionsByAuditCycleId(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={'GET':[GROUP_NAME_CLIENT]}
    def get(self,request,questionnaire_type_id):
        audit_cycle_ids=request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({'message':'audit_cycle_ids is required.'},status=400)
        try:
            audit_cycle_ids=[int(i.strip()) for i in audit_cycle_ids.split(',') if i.strip()]
        except ValueError:
            return Response({'message':'Invalid audit_cycle_ids.'},status=400)
        if not audit_cycle_ids:
            return Response({'message':'audit_cycle_ids is required.'},status=400)
        data=improvable_questions.get_improvable_questions_by_audit_cycle(audit_cycle_ids,questionnaire_type_id,request.user.clientuser)
        return Response(data)

class AudiCycleImprovableQuestion(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request,questionnaire_type_id):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({'error': 'audit_cycle_ids is required.'},status=400)
        try:
            audit_cycle_ids = [
                int(x.strip())
                for x in audit_cycle_ids.split(',')
                if x.strip()
            ]
        except ValueError:
            return Response({'error': 'Invalid audit_cycle_ids or questionnaire_type_id.'}, status=400)

        if not audit_cycle_ids:
            return Response({'error': 'audit_cycle_ids cannot be empty.'}, status=400)

        audit_cycle_improvable_questions = ( improvable_questions.get_improvable_questions_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, request.user.clientuser ))
        return Response(audit_cycle_improvable_questions)
    
class ImprovableQuestionList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, question_id):
        audit_cycle_improvable_questions = improvable_questions.get_improvable_questions_list(question_id, request.user.clientuser)
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

class QuestionnaireSurveyByAuditCycleIds(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {'GET': [GROUP_NAME_CLIENT]}
    def get(self, request, questionnaire_type_id):
        audit_cycle_ids = request.GET.get('audit_cycle_ids')
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(',') if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)
        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)
        data = questionnaire_survey.get_questionnaire_survey_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, request.user.clientuser)
        return Response(data)


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
        return Response(handles)

class ReportSummaryHandlesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        client_id = request.user.clientuser.client_id
        audit_cycles = twitter_client.get_handles_for_reportsummary_by_client(client_id)
        return Response({"audit_cycle": audit_cycles})

class SummaryAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        twitter_feeds = twitter_client.get_feeds_for_report_summary_client_and_handle(request.user.clientuser.client_id, audit_cycle_id)
        return Response(SentimentDataSerializer(twitter_feeds, many=True).data)

class GetAllSummaryAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        all_summary = twitter_client.get_over_all_summary(request.user.clientuser.client_id, audit_cycle_id)
        return Response(all_summary)

class GetNPSScore(APIView):
    permission_classes = [HasGroupPermission]
    # permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }    
    def get(self, request, audit_cycle_id, format=None):
        client_id = request.user.clientuser.client_id
        nps_score_data = twitter_client.get_over_all_nps_score(client_id, audit_cycle_id)
        return Response(nps_score_data)

class GetNPSScores(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, format=None):
        client_id = request.user.clientuser.client_id
        audit_cycle_ids = request.GET.get("audit_cycle_ids")

        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)

        try:
            audit_cycle_ids = [int(i.strip()) for i in audit_cycle_ids.split(",") if i.strip()]
        except ValueError:
            return Response({"message": "Invalid audit_cycle_ids."}, status=400)

        if not audit_cycle_ids:
            return Response({"message": "audit_cycle_ids is required."}, status=400)

        data = twitter_client.get_all_over_all_nps_score(client_id, audit_cycle_ids)
        return Response(data)
    
# class SentimentDataView(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'GET': [GROUP_NAME_CLIENT],
#     }
#     def get(self,request,audit_store_id,format=None):
#         sentiment_data = AuditStore.objects.filter(id=audit_store_id)
#         return Response(SentimentDataSerializer(sentiment_data,many=True).data)
    
class SentimentDataView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, audit_store_id, format=None):
        audit_store = AuditStore.objects.filter(id=audit_store_id).first()

        if not audit_store:
            return Response({"error": "Not found"}, status=404)

        if not audit_store.sentiment_score or not audit_store.sentiment_text:
            if audit_store.report_summary and audit_store.report_summary.strip():
                try:
                    sentiment_data = get_sentiment_data(audit_store.report_summary)

                    audit_store.main_keywords = sentiment_data.get('keywords')
                    audit_store.bullet_points = sentiment_data.get('key_sentences')
                    audit_store.sentiment_emotions = sentiment_data.get('emotions')
                    audit_store.sentiment_positive_words = sentiment_data.get('positive_words')
                    audit_store.sentiment_negative_words = sentiment_data.get('negative_words')
                    audit_store.sentiment_score = sentiment_data.get('sentiment_score')
                    audit_store.sentiment_text = sentiment_data.get('sentiment_result')

                    audit_store.save()

                except Exception as e:
                    print("Error in sentiment auto-fill:", e)

        return Response(SentimentDataSerializer([audit_store], many=True).data)

class SentimentData(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, format=None):
        data = self.update_sentiment_data()
        return JsonResponse(data)

    def update_sentiment_data(self):
        json_file_path = "./datasets/report_summary_sentiment_data.json"

        try:
            with open(json_file_path, "r", encoding="utf-8") as json_file:
                data = json.load(json_file)

                updated_count = 0
                for row in data:
                    audit_store_id = row.get("id")
                    if audit_store_id and AuditStore.objects.filter(id=audit_store_id).exists():
                        report_summary = row.get("report_summary", "")
                        main_keywords = row.get("main_keywords", {})
                        bullet_points = row.get("bullet_points", {})
                        sentiment_emotions = row.get("sentiment_emotions", {})
                        sentiment_positive_words = row.get("sentiment_positive_words", {})
                        sentiment_negative_words = row.get("sentiment_negative_words", {})
                        sentiment_score = row.get("sentiment_score", "")
                        sentiment_text = row.get("sentiment_text", "")

                        AuditStore.objects.filter(id=audit_store_id).update(
                            report_summary=report_summary,
                            main_keywords=main_keywords,
                            bullet_points=bullet_points,
                            sentiment_emotions=sentiment_emotions,
                            sentiment_positive_words=sentiment_positive_words,
                            sentiment_negative_words=sentiment_negative_words,
                            sentiment_score=sentiment_score,
                            sentiment_text=sentiment_text,
                        )
                        updated_count += 1

                if updated_count > 0:
                    response_data = {"message": "Sentiment data updated successfully", "updated_records_count": updated_count}
                else:
                    response_data = {"message": "No records updated"}

                return response_data

        except FileNotFoundError:
            return {"error": "File not found"}

        except KeyError as e:
            return {"error": "KeyError: " + str(e)}

        except Exception as e:
            return {"error": str(e)}
        
class TwitterFeedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, twitter_handle_id, format=None):
        twitter_feeds = twitter_client.get_feeds_for_client_and_handle(request.user.clientuser.client_id, twitter_handle_id)
        return Response(AuditStoreSerializer(twitter_feeds, many=True).data)

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

class DashboardWidgetAccessView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request):
        widget_access = questionnaire_type_client_service.find_dashboard_widget_access_by_user(request.user)
        return Response(widget_access)


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
    

class StoreSampleClientXlsxView(APIView):
    permission_classes = [AllowAny]
    # permission_classes = [HasGroupPermission]

    # required_groups = {
    #     'GET': [GROUP_NAME_CLIENT]
    # }
    def get(self, request):
        report, name = store_import_xlsx.find_sample_xlsx_for_store_insert()
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response
    
class ImportClientStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request, client_id):
        form = StoreImportDeSerializer(request.data, request.FILES)
        if form.is_valid():
            import_store_by_xlsx_sheet(client_id, request.FILES['file_uploaded'])
        return Response(status=200)
    
