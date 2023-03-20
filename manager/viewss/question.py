from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.models import Question
from questionnaire.service import question as question_service

class QuestionSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'section',
            'question_type',
            'question_data',
            'hide_question',
            'optional_comment_required',
        )
        read_only_fields = fields


class QuestionDeSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'section',
            'question_type',
            'question_data',
            'hide_question',
            'optional_comment_required',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            question = Question.objects.get(id=self.context.get('id'))
        else:
            question = Question()
        question.sequence = self.validated_data.get('sequence', question.sequence)
        question.question_txt = self.validated_data.get('question_txt', question.question_txt)
        question.max_marks = self.validated_data.get('max_marks', question.max_marks)
        question.section = self.validated_data.get('section', question.section_id)
        question.question_type = self.validated_data.get('question_type', question.question_type)
        question.question_data = self.validated_data.get('question_data', question.question_data)
        question.hide_question = self.validated_data.get('hide_question', question.hide_question)
        question.optional_comment_required = self.validated_data.get('optional_comment_required', question.optional_comment_required)
        return question


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
