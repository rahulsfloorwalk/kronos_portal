from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import question as question_service

from ..serializers import QuestionSerializer, QuestionDeSerializer


class QuestionViewBySection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, section_id, format=None):
        questions = question_service.find_questions_by_section_id(section_id)
        return Response(QuestionSerializer(questions, many=True).data)

class QuestionIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, question_id, format=None):
        question = question_service.find_question_by_id(question_id)
        return Response(QuestionSerializer(question).data)

    def post(self, request, question_id):
        q_ds = QuestionDeSerializer(data=request.data, context={'id':question_id})
        q_ds.is_valid(raise_exception=True)
        question = q_ds.deserialize()
        saved_question = question_service.save(question)
        return Response(QuestionSerializer(saved_question).data)

    def delete(self, request, question_id):
        question_service.delete_question_by_id(question_id)
        return HttpResponse(status=204)

class QuestionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        q_ds = QuestionDeSerializer(data=request.data)
        q_ds.is_valid(raise_exception=True)
        question = q_ds.deserialize()
        saved_question = question_service.save(question)
        return Response(QuestionSerializer(saved_question).data)
