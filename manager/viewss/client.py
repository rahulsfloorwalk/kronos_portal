from django.http import Http404

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import ClientSerializer
from ..service import client as client_service

from client.models import Client


class ClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        try:
            client = Client.objects.all()
            return Response(ClientSerializer(client, many=True).data)
        except Client.DoesNotExist:
            raise Http404

    def post(self, request):
        client_s = ClientSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)

class ClientIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, client_id, format=None):
        try:
            client = Client.objects.get(id=client_id)
            return Response(ClientSerializer(client).data)
        except Client.DoesNotExist:
            raise Http404

    def post(self, request, client_id):
        client_s = ClientSerializer(data=request.data, context={'id': client_id})
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)

    def delete(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            client.delete()
            return Response(ClientSerializer(client).data)
        except Client.DoesNotExist:
            raise Http404
