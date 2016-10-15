from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError

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

    def save(self, **kwargs):
        id = kwargs['id']
        if id is None:
            client = Client()
            client.name = self.validated_data.get('name')
            client.email = self.validated_data.get('email')
            client.phone = self.validated_data.get('phone')
        else:
            client = Client.objects.get(id=id)
            client.name = self.validated_data.get('name', client.name)
            client.email = self.validated_data.get('email', client.email)
            client.phone = self.validated_data.get('phone', client.phone)

        client.save()
        return client

class LocationSerializer(ModelSerializer):
    class Meta:
        model = Location
        fields = (
            'id',
            'name',
            'pincode',
            'city_id',
        )
        read_only_fields = ('id',)

    def save(self, **kwargs):
        location = Location()
        location.name = self.validated_data.get('name')
        location.pincode = self.validated_data.get('pincode')
        location.city_id = kwargs['city']

        location.save()
        return location

class AuditSerializer(ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'description',
            'client_id',
        )
        read_only_fields = ('id',)

    def save(self, **kwargs):
        audit = Audit()
        audit.type = self.validated_data.get('type')
        audit.status = self.validated_data.get('status')
        audit.start_date = self.validated_data.get('start_date')
        audit.end_date = self.validated_data.get('end_date')
        audit.description = self.validated_data.get('description')
        audit.client_id = kwargs['client']

        audit.save()
        return audit

class AuditLocationSerializer(ModelSerializer):
    class Meta:
        model = AuditLocation
        fields = (
            'id',
            'audit_id',
            'location_id',
            'count',
        )
        read_only_fields = ('id',)

    def save(self, **kwargs):
        audit_location = AuditLocation()
        audit_location.count = self.validated_data.get('count')
        audit_location.audit_id = kwargs['audit']
        audit_location.location_id = kwargs['location']

        audit_location.save()
        return audit_location
