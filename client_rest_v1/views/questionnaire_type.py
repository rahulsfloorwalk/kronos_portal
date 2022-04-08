from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from questionnaire.models import QuestionnaireType

from client.service import client_service
from ..services import questionnaire_type as questionnaire_type_service
from ..serializers import QuestionnaireTypeSerializer


class QuestionnaireTypeByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        questionnaire_types = questionnaire_type_service.find_questionnaire_type_by_client(client.id)
        return Response(QuestionnaireTypeSerializer(questionnaire_types, many=True).data)

    def post(self, request):
        ds = QuestionnaireTypeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        ds.save()
        return Response(ds.data)


class QuestionnaireTypeIdView(APIView):
    def get(self, request, questionnaire_type_id):
        questionnaire_type = get_object_or_404(QuestionnaireType, pk=questionnaire_type_id)
        return Response(QuestionnaireTypeSerializer(questionnaire_type).data)

    def post(self, request, questionnaire_type_id):
        questionnaire_type = get_object_or_404(QuestionnaireType, pk=questionnaire_type_id)
        ds = QuestionnaireTypeSerializer(questionnaire_type, data=request.data)
        ds.is_valid(raise_exception=True)
        ds.save()
        return Response(ds.data)

    def delete(self, request, questionnaire_type_id):
        questionnaire_type_service.delete_questionnaire_type_by_id(questionnaire_type_id)
        return Response(status=204)
