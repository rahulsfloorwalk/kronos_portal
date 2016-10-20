from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError, SlugRelatedField, PrimaryKeyRelatedField

from .models import City, Location, Client, Audit, AuditLocation, City

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
        )
        read_only_fields = ('id',)

    def create(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            client = Client.objects.get(id=kwargs['id'])
        else:
            client = Client()
        client.name = self.validated_data.get('name', client.name)
        client.email = self.validated_data.get('email', client.email)
        client.phone = self.validated_data.get('phone', client.phone)
        return client

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
        )
        read_only_fields = ('id',)

class LocationSerializer(ModelSerializer):
    city = CitySerializer()

    class Meta:
        model = Location
        fields = (
            'id',
            'name',
            'pincode',
            'city',
        )
        read_only_fields = ('id','name','pincode','city')

class LocationDeSerializer(ModelSerializer):
    class Meta:
        model = Location
        fields = (
            'id',
            'name',
            'pincode',
            'city',
        )
        read_only_fields = ('id',)

    def deserialize(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            location = Location.objects.get(id=kwargs['id'])
        else:
            location = Location()
        location.name = self.validated_data.get('name', location.name)
        location.pincode = self.validated_data.get('pincode', location.pincode)
        location.city = self.validated_data.get('city', location.city_id)
        return location

class AuditSerializer(ModelSerializer):
    client = SlugRelatedField(slug_field='id', queryset=Client.objects.all())
    class Meta:
        model = Audit
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'description',
            'client',
        )
        read_only_fields = ('id',)

    def create(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            audit = Audit.objects.get(id=kwargs['id'])
        else:
            audit = Audit()
        audit.type = self.validated_data.get('type', audit.type)
        audit.status = self.validated_data.get('status', audit.status)
        audit.start_date = self.validated_data.get('start_date', audit.start_date)
        audit.end_date = self.validated_data.get('end_date', audit.end_date)
        audit.description = self.validated_data.get('description', audit.description)
        audit.client = self.validated_data.get('client', audit.client_id)
        return audit

class AuditLocationSerializer(ModelSerializer):
    location = SlugRelatedField(slug_field='id', queryset=Location.objects.all())
    audit = SlugRelatedField(slug_field='id', queryset=Audit.objects.all())
    class Meta:
        model = AuditLocation
        fields = (
            'id',
            'audit',
            'location',
            'count',
        )
        read_only_fields = ('id',)

    def create(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            audit_location = AuditLocation.objects.get(id=kwargs['id'])
        else:
            audit_location = AuditLocation()
        audit_location.count = self.validated_data.get('count', audit_location.count)
        audit_location.audit = self.validated_data.get('audit', audit_location.audit_id)
        audit_location.location = self.validated_data.get('location', audit_location.location_id)

        return audit_location
