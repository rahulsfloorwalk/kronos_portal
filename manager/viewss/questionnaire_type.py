from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import PrimaryKeyRelatedField

from questionnaire.models import QuestionnaireType
from manager.views import ManagerAPIView

class QuestionnaireTypeSerializer(ModelSerializer):
    client = PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = QuestionnaireType
        fields = (
            'id',
            'name',
            'is_default',
            'client',
            'client_id',
        )
        read_only_fields = ('id',)

class QuestionnaireTypeByClientView(ManagerAPIView):
    def get(self, request, client_id, format=None):
        questionnaire_types = QuestionnaireType.objects.filter(client_id=client_id)
        return Response(QuestionnaireTypeSerializer(questionnaire_types, many=True).data)

