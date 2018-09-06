from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER
from registration.service.agency import find_agency_user_by_user_id

from manager.serializers import UserSerializer

class AgencyPresenceByUserId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, user_id, format=None):
        user = find_agency_user_by_user_id(user_id)
        return Response(UserSerializer(user).data)

