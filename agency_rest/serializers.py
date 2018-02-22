
from django.contrib.auth.models import User

from rest_framework.serializers import ModelSerializer

from manager.models import City
from registration.models import MobileNumber

from agency.models import Agency
from agency.models import AgencyUser
from agency.models import AgencyPresence

class AgencySerializer(ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            'id',
            'name',
            'formed_in_year',
            'gstin',
            'cin',
            'strength',
        )
        read_only_fields = ('id',)

class AgencyUserSerializer(ModelSerializer):
    agency = AgencySerializer()
    class Meta:
        model = AgencyUser
        fields = (
            'id',
            'full_name',
            'agency',
            'user_id',
        )
        read_only_fields = fields

class MobileNumberSerializer(ModelSerializer):
    class Meta:
        model = MobileNumber
        fields = (
            'id',
            'mobile_number',
            'is_verified',
            'user_id',
        )
        read_only_fields = fields

class UserSerializer(ModelSerializer):
    agencyuser = AgencyUserSerializer()
    mobile_numbers = MobileNumberSerializer(many=True)
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'agencyuser',
            'mobile_numbers',
        )

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
        )

class AgencyPresenceSerializer(ModelSerializer):
    class Meta:
        model = AgencyPresence
        fields = (
            'id',
            'present',
            'agency_id',
            'city_id',
        )
        read_only_fields = fields

