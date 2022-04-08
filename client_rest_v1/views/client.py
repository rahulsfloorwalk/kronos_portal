from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from client.service import client_service

from ..serializers import ClientBankInfoSerializer, ClientSerializer

# Create your views here.


class ClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        return Response(ClientSerializer(client).data)


class ClientIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
    }
    def get(self, request, client_id, format=None):
        client = client_service.find_client_by_id(client_id)
        return Response(ClientSerializer(client).data)

    def post(self, request, client_id):
        client_s = ClientSerializer(data=request.data, context={'id': client_id})
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)


class ClientBankInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
    }
    def get(self, request, client_id, format=None):
        client = client_service.find_bank_info_by_id(client_id)
        return Response(ClientBankInfoSerializer(client).data)

    def post(self, request, client_id):
        bank_info_s = ClientBankInfoSerializer(data=request.data, context={'client_id': client_id})
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.deserialize()
        savedBankInfo = bank_info.save()
        return Response(ClientBankInfoSerializer(savedBankInfo).data)