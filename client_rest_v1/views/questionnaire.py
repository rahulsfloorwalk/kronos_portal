from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from questionnaire.models.questionnaire import Industry, ProblemStatement, SampleQuestionnaireType, SampleQuestionnaire

from questionnaire.service import questionnaire as questionnaire_service


class IndustrySerializer(ModelSerializer):
    class Meta:
        model = Industry
        fields = (
            'id',
            'name',
        )
        read_only_fields = fields


class ProblemStatementSerializer(ModelSerializer):
    class Meta:
        model = ProblemStatement
        fields = (
            'id',
            'name',
            'industry',
        )
        read_only_fields = fields


class QuestionnaireTypeSerializer(ModelSerializer):
    class Meta:
        model = SampleQuestionnaireType
        fields = (
            'id',
            'name',
            'problem_statement'
        )
        read_only_fields = fields


class SampleQuestionnaireSerializer(ModelSerializer):
    class Meta:
        model = SampleQuestionnaire
        fields = (
            'id',
            'questionnaire_data',
            'sample_questionnaire_type'
        )
        read_only_fields = fields


class IndustryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, format=None):
        industry = questionnaire_service.get_industry_list()
        return Response(IndustrySerializer(industry, many=True).data)


class ProblemStatementByIndustryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, industry_id, format=None):
        problem_statement = questionnaire_service.get_problem_statement_by_industry(industry_id)
        return Response(ProblemStatementSerializer(problem_statement, many=True).data)


class QuestionnaireTypeByProblemStatementView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, problem_statement_id, format=None):
        problem_statement = questionnaire_service.find_sample_questionnaire_type_by_problem_statement(problem_statement_id)
        return Response(QuestionnaireTypeSerializer(problem_statement, many=True).data)


class QuestionnaireByQuestionnaireTypeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, questionnaire_type_id, format=None):
        questionnaire = questionnaire_service.find_sample_questionnaire_by_questionnaire_type(questionnaire_type_id)
        return Response(SampleQuestionnaireSerializer(questionnaire).data)


class SampleQuestionnaireInsertView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, audit_cycle_id, sample_questionnaire_id, format=None):
        questionnaire_service.insert_sample_questionnaire_to_audit_cycle(audit_cycle_id, sample_questionnaire_id)
        return Response()