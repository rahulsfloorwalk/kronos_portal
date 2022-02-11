from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer
from client.service import client_service
from client.service import client_trainer as client_trainer_service
from client.models import ClientTrainer, Client

class ClientTrainerSerializer(ModelSerializer):
    user = PlainUserSerializer()
    class Meta:
        model = ClientTrainer
        fields = (
            'id',
            'client',
            'user',
            'receive_email_notification',
            'is_active'
        )
        read_only_fields = fields


class ClientTrainerDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    trainer = IntegerField()
    receive_email_notification = BooleanField()
    is_active = BooleanField()


class ClientTrainerByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        client_trainers = client_service.find_client_by_id(client_id).trainers
        return Response(ClientTrainerSerializer(client_trainers, many=True).data)


class ClientTrainerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        client_trainer_ds = ClientTrainerDeSerializer(data=request.data)
        client_trainer_ds.is_valid(raise_exception=True)
        saved_client_trainer = client_trainer_service.insert(
            client_trainer_ds.validated_data["client"],
            client_trainer_ds.validated_data["trainer"],
            client_trainer_ds.validated_data["receive_email_notification"],
            client_trainer_ds.validated_data["is_active"]
        )
        return Response(ClientTrainerSerializer(saved_client_trainer).data)


class ClientTrainerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_trainer_id):
        client_trainer = client_trainer_service.find_client_trainer_by_id(client_trainer_id)
        return Response(ClientTrainerSerializer(client_trainer).data)

    def post(self, request, client_trainer_id):
        client_trainer = client_trainer_service.update(client_trainer_id,
                                                       request.data['receive_email_notification'],
                                                       request.data['is_active'])
        return Response(ClientTrainerSerializer(client_trainer).data)
