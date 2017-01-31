from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import question as question_service

from questionnaire.models import Question
from ..serializers import QuestionSerializer, QuestionDeSerializer


class QuestionViewBySection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, section_id, format=None):
        try:
            questions = Question.objects.filter(section_id=section_id).all()
            return Response(QuestionSerializer(questions, many=True).data)
        except Question.DoesNotExist:
            raise Http404

class QuestionIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, question_id, format=None):
        try:
            question = Question.objects.get(pk=question_id)
            return Response(QuestionSerializer(question).data)
        except Question.DoesNotExist:
            return Http404

    def post(self, request, question_id):
        q_ds = QuestionDeSerializer(data=request.data, context={'id':question_id})
        q_ds.is_valid(raise_exception=True)
        question = q_ds.deserialize()
        saved_question = question_service.save(question)
        return Response(QuestionSerializer(saved_question).data)

    def delete(self, request, question_id):
        try:
            question = Question.objects.get(question_id)
            question.delete()
            return Response(QuestionSerializer(question).data)
        except Question.DoesNotExist:
            raise Http404

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
