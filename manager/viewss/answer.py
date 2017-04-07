from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, IntegerField, CharField

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from answer.models import Answer
from ..serializers import AnswerSerializer
from answer.service import answer as answer_service

class AnswerByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_store_id, format=None):
        answers = Answer.objects.filter(audit_store_id=audit_store_id)
        return Response(AnswerSerializer(answers, many=True).data)

class MarkByQuestionAndStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST' : [GROUP_NAME_MANAGER],
    }
    class MarkDeserializer(Serializer):
        marks = IntegerField(min_value=0)

    def post(self, request, audit_store_id, question_id):
        ds = self.MarkDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        marks = ds.validated_data.get('marks')
        try:
            answer = answer_service.set_marks(audit_store_id, question_id, marks)
            return Response(AnswerSerializer(answer).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class AnswerByQuestionAndStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST' : [GROUP_NAME_MANAGER],
    }
    class AnswerDeserializer(Serializer):
        answer_text = CharField()

    def post(self, request, audit_store_id, question_id):
        ds = AnswerByQuestionAndStore.AnswerDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_text = ds.validated_data.get('answer_text')
        try:
            answer = answer_service.set_answer_text(audit_store_id, question_id, answer_text)
            return Response(AnswerSerializer(answer).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e
