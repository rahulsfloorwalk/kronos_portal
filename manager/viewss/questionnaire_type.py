from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import PrimaryKeyRelatedField

from questionnaire.models import QuestionnaireType
from manager.views import ManagerAPIView
from client.models import Client

class QuestionnaireTypeSerializer(ModelSerializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
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

class QuestionnaireTypeView(ManagerAPIView):
    def post(self, request):
        ds = QuestionnaireTypeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        ds.save()
        return Response(ds.data)

