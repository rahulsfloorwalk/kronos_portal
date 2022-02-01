from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.serializers import IntegerField, PrimaryKeyRelatedField, CharField, EmailField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer
from client.service import client_user as client_user_service
from client.service import client_service
from client.models import ClientUser, Client

class ClientUserSerializer(ModelSerializer):
    user = PlainUserSerializer()
    class Meta:
        model = ClientUser
        fields = (
            'id',
            'full_name',
            'client',
            'user',
            'is_client_admin',
            'receive_email_notification',
        )
        read_only_fields = fields

class ClientUserDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    full_name = CharField(max_length=50)
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    is_client_admin = BooleanField()
    receive_email_notification = BooleanField()


class ClientUserByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        client_users = client_service.find_client_by_id(client_id).users
        return Response(ClientUserSerializer(client_users, many=True).data)

class ClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        client_user_ds = ClientUserDeSerializer(data=request.data)
        client_user_ds.is_valid(raise_exception=True)
        saved_client_user = client_user_service.insert(
            client_user_ds.validated_data["client"],
            client_user_ds.validated_data["full_name"],
            client_user_ds.validated_data["email"],
            client_user_ds.validated_data["is_client_admin"],
            client_user_ds.validated_data["password"],
            client_user_ds.validated_data["is_active"],
            client_user_ds.validated_data["receive_email_notification"]
        )
        return Response(ClientUserSerializer(saved_client_user).data)

class ClientUserIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_user_id, format=None):
        client_user = client_user_service.find_clientuser_by_id(client_user_id)
        return Response(ClientUserSerializer(client_user).data)

    def post(self, request, client_user_id):
        client_user_ds = ClientUserDeSerializer(data=request.data)
        client_user_ds.is_valid(raise_exception=True)
        saved_client_user = client_user_service.update(
            client_user_id,
            client_user_ds.validated_data["client"],
            client_user_ds.validated_data["full_name"],
            client_user_ds.validated_data["email"],
            client_user_ds.validated_data["is_client_admin"],
            client_user_ds.validated_data["password"],
            client_user_ds.validated_data["is_active"],
            client_user_ds.validated_data["receive_email_notification"]
        )
        return Response(ClientUserSerializer(saved_client_user).data)

class ClientUserByStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        user_id = IntegerField()

    def get(self, request, store_id):
        users = client_user_service.find_by_visible_store(store_id)
        return Response((u.id for u in users))

    def post(self, request, store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        users = client_user_service.assign_store_to_client_user(
            store_id,
            ds.validated_data["user_id"],
        )
        return Response((u.id for u in users))

    def delete(self, request, store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        users = client_user_service.revoke_store_from_client_user(
            store_id,
            ds.validated_data["user_id"],
        )
        return Response((u.id for u in users))


class ClientUserAssignStoresView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_user_id):
        assign_store_list = client_user_service.get_assign_stores_to_non_admin_user(client_user_id)
        return Response({"store_list": assign_store_list})

    def post(self, request, client_user_id):
        assign_store_list = client_user_service.assign_stores_to_non_admin_user(client_user_id,
                                                                                request.data['stores_list'])
        return Response({"store_list": assign_store_list})
