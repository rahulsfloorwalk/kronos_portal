from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from ..models import City

from ..serializers import CitySerializer

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from .. import states
from manager.states import get_state_by_country
from .. import country
from rest_framework.permissions import AllowAny
from manager.models import ManagerProfileInfo

class CityView(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class StateView(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        return Response(states.states)
    
class StateByCountryCodeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        try:
            manager = ManagerProfileInfo.objects.get(user=request.user)
            allowed_countries = manager.allowed_countries or []
            print("ASSIGNED COUNTRIES:", allowed_countries)
        except ManagerProfileInfo.DoesNotExist:
            return Response(dict(states))

        if not allowed_countries:
            return Response(dict(states))
        filtered_states = {}

        for country in allowed_countries:
            country_states = get_state_by_country(country)
            filtered_states.update(country_states)
        return Response(filtered_states)


class CountryView(APIView):
    # permission_classes = [HasGroupPermission]
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request):
        return Response(country.country)


class StateViewByCountryId(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, country):
        return Response(states.get_state_by_country(country))
