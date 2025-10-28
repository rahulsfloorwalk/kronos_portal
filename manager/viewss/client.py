from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from rest_framework.permissions import AllowAny
from ..serializers import ClientSerializer,ClientForEcommSerializer
from client.service import client_service,client_user_service
from rest_framework.throttling import AnonRateThrottle
from manager.models import ManagerProfileInfo
from client.models import Client,ClientManager
from client.service import client_manager as client_manager_service

class ClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        clients = client_service.find_all_clients_if_true(request.user)
        return Response(ClientSerializer(clients, many=True).data)

    def post(self, request):
        client_s = ClientSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_service.save(client)

        manager_profile = ManagerProfileInfo.objects.filter(user=request.user).first()
        if manager_profile and not manager_profile.is_admin:
            client_manager_service.insert(
                client=savedClient,
                manager_id=request.user.id,
                receive_email_notification=True,
                is_active=True
            )
        return Response(ClientSerializer(savedClient).data)

class ClientIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        client = client_service.find_client_by_id(client_id)
        try:
            manager_profile = ManagerProfileInfo.objects.get(user=request.user)

            if manager_profile.is_admin:
                client = client_service.find_client_by_id(client_id)
            else:
                client_managers = ClientManager.objects.filter(user=request.user,is_active=True,client_id=client_id)
                if client_managers.exists():
                    client = client_service.find_client_by_id(client_id)
                else:
                    return Response({"detail": "You are not authorized to view this data."}, status=200)
        except ManagerProfileInfo.DoesNotExist:
            return Response({"detail": "You are not authorized to view this data."}, status=200)
        return Response(ClientSerializer(client).data)

    def post(self, request, client_id):
        client_s = ClientSerializer(data=request.data, context={'id': client_id})
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)


class ClientViewByDashboardCyleStatus(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        clients = client_service.find_client_by_dashboard_cycle_status()
        return Response(ClientSerializer(clients, many=True).data)

class ClientUserAdd(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    def get(self,request,format=None):
        clients = client_user_service.find_all_client_users()
        return Response(ClientForEcommSerializer(clients, many=True).data)
    
    def post(self,request):
        client_s = ClientForEcommSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.deserialize()
        savedClient = client_user_service.save(client)
        return Response(ClientForEcommSerializer(savedClient).data)