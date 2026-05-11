from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer, ListField
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField
from rest_framework.permissions import AllowAny,IsAuthenticated

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer,PlainmoderatorUserSerializer
from client.service import client_service
from client.service import client_manager as client_manager_service
from client.models import ClientManager, Client, ClientModerator
from ..service import moderator as moderator_service


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

class ClientModeratorSerializer(ModelSerializer):
    user = PlainmoderatorUserSerializer()
    class Meta:
        model = ClientModerator
        fields = (
            'id',
            'client',
            'user',
            'receive_email_notification',
            'is_active'
        )
        read_only_fields = fields


class ClientModeratorDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    moderator = ListField(child=IntegerField())
    receive_email_notification = BooleanField()
    is_active = BooleanField()

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

class ClientModeratorByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        client_moderators = client_service.find_client_by_id(client_id).moderator
        client_moderators.filter(user__is_active=False,is_active=True).update(is_active=False)
        client_moderators = client_moderators.filter(is_active=True).select_related('user')

        return Response(ClientModeratorSerializer(client_moderators, many=True).data)

class ClientModeratorAssignView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        users = moderator_service.find_all()
        assigned_ids = ClientModerator.objects.filter(client_id=client_id,is_active=True).values_list("user_id", flat=True)

        response_data = []
        for user in users:
            # if user.id not in assigned_ids:
            response_data.append({"id": user.id,"email": user.email,"assigned": user.id in assigned_ids})
        return Response(response_data)

class ClientModeratorView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        client_moderator_ds = ClientModeratorDeSerializer(data=request.data)
        client_moderator_ds.is_valid(raise_exception=True)
        saved_client_moderator = client_manager_service.insert_moderators(
            client_moderator_ds.validated_data["client"],
            client_moderator_ds.validated_data["moderator"],
            client_moderator_ds.validated_data["receive_email_notification"],
            client_moderator_ds.validated_data["is_active"]
        )
        return Response(ClientModeratorSerializer(saved_client_moderator, many=True).data)
    
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

class ClientModeratorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_moderator_id):
        client_moderator = client_manager_service.find_client_moderator_by_id(client_moderator_id)
        return Response(ClientModeratorSerializer(client_moderator).data)

    def post(self, request, client_moderator_id):
        client_moderator = client_manager_service.update_moderator(client_moderator_id,
                                                       request.data['receive_email_notification'],
                                                       request.data['is_active'])
        return Response(ClientModeratorSerializer(client_moderator).data)
