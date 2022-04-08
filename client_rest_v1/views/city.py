from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from manager.models import City

from ..serializers import CitySerializer

from registration.models import GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission

from manager.models import states
from manager.models import country


class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class StateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self, request, format=None):
        return Response(states.states)


class CountryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request):
        return Response(country.country)


class StateViewByCountryId(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, country):
        return Response(states.get_state_by_country(country))
