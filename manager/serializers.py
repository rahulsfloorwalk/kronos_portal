from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError, SlugRelatedField, PrimaryKeyRelatedField
from django.contrib.auth.models import User

from auditor.models import ProfileInfo, AuditApplication
from audit.models import Audit, AuditCycle
from client.models import Client, Store
from .models import City, Location

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


class AuditCycleSerializer(ModelSerializer):
    client = ClientSerializer()
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'type',
            'status',
            'start_date',
            'end_date',
            'earnings_per_audit',
            'description',
            'client',
            #'audit_count',
        )
        read_only_fields = fields


class AuditCycleDeSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
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

    def deserialize(self):
        print("self.context", self.context)
        if 'id' in self.context and self.context.get('id') is not None:
            audit_cycle = AuditCycle.objects.get(id=self.context.get('id'))
        else:
            audit_cycle = AuditCycle()
        audit_cycle.type = self.validated_data.get('type', audit_cycle.type)
        audit_cycle.status = self.validated_data.get('status', audit_cycle.status)
        audit_cycle.start_date = self.validated_data.get('start_date', audit_cycle.start_date)
        audit_cycle.end_date = self.validated_data.get('end_date', audit_cycle.end_date)
        audit_cycle.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit_cycle.earnings_per_audit)
        audit_cycle.description = self.validated_data.get('description', audit_cycle.description)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        return audit_cycle


class StoreSerializer(ModelSerializer):
    location = LocationSerializer()
    client = ClientSerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'location',
            'client',
        )
        read_only_fields = fields


class StoreDeSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'location',
            'client',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            store = Store.objects.get(id=self.context.get('id'))
        else:
            store = Store()
        store.name = self.validated_data.get('name', store.name)
        store.address = self.validated_data.get('address', store.address)
        store.location = self.validated_data.get('location', store.location_id)
        store.client = self.validated_data.get('client', store.client_id)
        return store


class AuditSerializer(ModelSerializer):
    store = StoreSerializer()
    audit_cycle = AuditCycleSerializer()
    class Meta:
        model = Audit
        fields = (
            'id',
            'store',
            'audit_cycle',
        )
        read_only_fields = fields


class AuditDeSerializer(ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'id',
            'store',
            'audit_cycle',
        )
        read_only_fields = ('id',)
        validators=[]

    #def validate(self, attrs):
    #    store = attrs.get('store')
    #    audit_cycle = attrs.get('audit_cycle')

    #    print('AuditDeSerializer#validate called')
    #    try:
    #        obj = AuditLocation.objects.get(audit=audit, location=location)
    #    except AuditLocation.DoesNotExist:
    #        return attrs
    #    print("self.context", self.context)
    #    print("obj.id",obj.id, type(obj.id))
    #    print("id",self.context.get("id"), type(self.context.get("id")))
    #    if self.context.get("id") and obj.id == int(self.context.get('id')):
    #        return attrs
    #    else:
    #        raise ValidationError('Audit with Location already exists')

    def create(self, **kwargs):
        if 'id' in kwargs and kwargs['id'] is not None:
            audit = Audit.objects.get(id=kwargs['id'])
        else:
            audit = Audit()
        audit.store_id = self.validated_data.get('store', audit.store_id)
        audit.audit_cycle = self.validated_data.get('audit_cycle', audit.audit_cycle)

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

class AuditApplicationSerializer(ModelSerializer):
    profileinfo = ProfileInfoSmallSerializer()
    class Meta:
        model = AuditApplication
        fields = (
            'id', 
            'status', 
            'audit_date', 
            'audit',
            'profileinfo',
        )
        read_only_fields = fields
