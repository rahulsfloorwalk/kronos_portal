from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer
from client.service import client_service
from client.service import client_manager as client_manager_service
from client.models import ClientManager, Client

class ClientManagerSerializer(ModelSerializer):
    user = PlainUserSerializer()
    class Meta:
        model = ClientManager
        fields = (
            'id',
            'client',
            'user',
            'receive_email_notification',
            'is_active'
        )
        read_only_fields = fields


class ClientManagerDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    manager = IntegerField()
    receive_email_notification = BooleanField()
    is_active = BooleanField()


class ClientManagerByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        client_managers = client_service.find_client_by_id(client_id).managers
        return Response(ClientManagerSerializer(client_managers, many=True).data)


class ClientManagerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        client_manager_ds = ClientManagerDeSerializer(data=request.data)
        client_manager_ds.is_valid(raise_exception=True)
        saved_client_manager = client_manager_service.insert(
            client_manager_ds.validated_data["client"],
            client_manager_ds.validated_data["manager"],
            client_manager_ds.validated_data["receive_email_notification"],
            client_manager_ds.validated_data["is_active"]
        )
        return Response(ClientManagerSerializer(saved_client_manager).data)


class ClientManagerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_manager_id):
        client_manager = client_manager_service.find_client_manager_by_id(client_manager_id)
        return Response(ClientManagerSerializer(client_manager).data)

    def post(self, request, client_manager_id):
        client_manager = client_manager_service.update(client_manager_id,
                                                       request.data['receive_email_notification'],
                                                       request.data['is_active'])
        return Response(ClientManagerSerializer(client_manager).data)
