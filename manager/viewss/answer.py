from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer, IntegerField, CharField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import AnswerSerializer
from answer.service import answer as answer_service

class AnswerByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store(audit_store_id)
        return Response(AnswerSerializer(answers, many=True).data)

class MarkByQuestionAndStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    class MarkDeserializer(Serializer):
        marks = IntegerField(min_value=0)

    def post(self, request, audit_store_id, question_id):
        ds = self.MarkDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        marks = ds.validated_data.get('marks')
        answer = answer_service.set_marks(audit_store_id, question_id, marks)
        return Response(AnswerSerializer(answer).data)


class AnswerNotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    class DeSerializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, question_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        not_applicable = ds.validated_data.get('not_applicable')
        answer = answer_service.set_not_applicable(audit_store_id, question_id, not_applicable)
        return Response(AnswerSerializer(answer).data)


class AnswerByQuestionAndStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    class AnswerDeserializer(Serializer):
        answer_text = CharField()

    def post(self, request, audit_store_id, question_id):
        ds = AnswerByQuestionAndStore.AnswerDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_text = ds.validated_data.get('answer_text')
        answer = answer_service.set_answer_text(audit_store_id, question_id, answer_text)
        return Response(AnswerSerializer(answer).data)


class AnswerCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id, question_id):
        try:
            answer = answer_service.set_answer_comment(audit_store_id, question_id, request.data["answer_comment"])
            return Response(AnswerSerializer(answer).data)
        except KeyError as e:
            raise ValidationError({
                e.args[0]: "{} is required".format(e.args[0])
            })
