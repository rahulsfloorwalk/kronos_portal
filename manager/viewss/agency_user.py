
from django.contrib.auth.models import User

from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from registration.service.agency import find_agency_user_by_user_id

from manager.serializers import UserSerializer, AgencyUserInfoSerializer

from agency.models.agency_user import AgencyUser

class AgencyUserSearchView(ListAPIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    queryset = User.objects.filter(groups__name=GROUP_NAME_AGENCY)
    serializer_class = UserSerializer
    filter_backends = (SearchFilter,)
    search_fields = (
        'email',
        'mobile_numbers__mobile_number',
        'agencyuser__full_name',
        'agencyuser__agency__name',
        'agencyuser__agency__presences__city__name',
    )

class AgencyUserIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, user_id, format=None):
        user = find_agency_user_by_user_id(user_id)
        return Response(UserSerializer(user).data)


class AgencyUserByPresenceInCityIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, city_id, format=None):
        user = AgencyUser.objects.find_by_presence_in_city_id(city_id)
        return Response(AgencyUserInfoSerializer(user, many=True).data)

