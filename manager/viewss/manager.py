from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import PlainUserSerializer, ManagerDeSerializer
from ..service import manager as manager_service


class ManagerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        users = manager_service.find_all()
        return Response(PlainUserSerializer(users, many=True).data)

    def post(self, request):
        manager_ds = ManagerDeSerializer(data=request.data)
        manager_ds.is_valid(raise_exception=True)
        saved_manager_user = manager_service.insert(
            manager_ds.validated_data["email"],
            manager_ds.validated_data["password"],
            manager_ds.validated_data["is_active"]
        )
        return Response(PlainUserSerializer(saved_manager_user).data)

class ManagerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, user_id, format=None):
        user = manager_service.find_by_id(user_id)
        return Response(PlainUserSerializer(user).data)

    def post(self, request, user_id):
        manager_ds = ManagerDeSerializer(data=request.data)
        manager_ds.is_valid(raise_exception=True)
        saved_user = manager_service.update(
            user_id,
            manager_ds.validated_data["email"],
            manager_ds.validated_data["password"],
            manager_ds.validated_data["is_active"]
        )
        return Response(PlainUserSerializer(saved_user).data)

