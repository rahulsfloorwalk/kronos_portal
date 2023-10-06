from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer
from client.service import client_service
class ClientRequirementsView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,client_id):
        pass
        # requirements = client_service.find_client_requirements_by_client_id(client_id)
    def post(self,request,client_id):
        pass
        