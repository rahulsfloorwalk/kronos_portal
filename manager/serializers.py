from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError, SlugRelatedField, PrimaryKeyRelatedField
from django.contrib.auth.models import User

from auditor.models import ProfileInfo, AuditApplication
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
            'state',
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
        read_only_fields = fields

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


class AuditLocationSerializer(ModelSerializer):
    location = LocationSerializer()
    class Meta:
        model = AuditLocation
        fields = (
            'id',
            'audit',
            'location',
            'count',
        )
        read_only_fields = fields


class AuditLocationDeSerializer(ModelSerializer):
    class Meta:
        model = AuditLocation
        fields = (
            'id',
            'audit',
            'location',
            'count',
        )
        read_only_fields = ('id',)
        validators=[]

    def validate(self, attrs):
        audit = attrs.get('audit')
        location = attrs.get('location')

        print('validator called')
        try:
            obj = AuditLocation.objects.get(audit=audit, location=location)
        except AuditLocation.DoesNotExist:
            return attrs
        print("self.context", self.context)
        print("obj.id",obj.id, type(obj.id))
        print("id",self.context.get("id"), type(self.context.get("id")))
        if self.context.get("id") and obj.id == int(self.context.get('id')):
            return attrs
        else:
            raise ValidationError('Audit with Location already exists')

    def create(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            audit_location = AuditLocation.objects.get(id=kwargs['id'])
        else:
            audit_location = AuditLocation()
        audit_location.count = self.validated_data.get('count', audit_location.count)
        audit_location.audit = self.validated_data.get('audit', audit_location.audit_id)
        audit_location.location = self.validated_data.get('location', audit_location.location_id)

        return audit_location

class AuditSerializer(ModelSerializer):
    client = ClientSerializer()
    auditlocations = AuditLocationSerializer(many=True)
    cities = CitySerializer(many=True)
    class Meta:
        model = Audit
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'earnings_per_audit',
            'description',
            'client',
            'auditlocations',
            'audit_count',
            'cities',
        )
        read_only_fields = fields

class AuditDeSerializer(ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'earnings_per_audit',
            'description',
            'client',
        )
        read_only_fields = ('id',)

    def deserialize(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            audit = Audit.objects.get(id=kwargs['id'])
        else:
            audit = Audit()
        audit.type = self.validated_data.get('type', audit.type)
        audit.status = self.validated_data.get('status', audit.status)
        audit.start_date = self.validated_data.get('start_date', audit.start_date)
        audit.end_date = self.validated_data.get('end_date', audit.end_date)
        audit.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit.earnings_per_audit)
        audit.description = self.validated_data.get('description', audit.description)
        audit.client = self.validated_data.get('client', audit.client_id)
        return audit


class ProfileInfoSmallSerializer(ModelSerializer):
    class Meta:
        model = ProfileInfo
        fields = (
            'id', 
            'first_name', 
            'last_name', 
            'mobile_number', 
            'city', 
            'user_id'
        )
        read_only_fields = fields

class AuditLocationApplicationSerializer(ModelSerializer):
    profileinfo = ProfileInfoSmallSerializer()
    class Meta:
        model = AuditApplication
        fields = (
            'id', 
            'status', 
            'audit_date', 
            'auditlocation',
            'profileinfo',
        )
        read_only_fields = fields
