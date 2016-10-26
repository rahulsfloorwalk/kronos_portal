from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Client, Audit, Location, AuditLocation, City
from .serializers import ClientSerializer, AuditLocationSerializer, CitySerializer
from .serializers import AuditLocationSerializer, AuditLocationDeSerializer
from .serializers import LocationSerializer, LocationDeSerializer
from .serializers import AuditSerializer, AuditDeSerializer
from .service.client import ClientService
from .service.location import LocationService
from .service import audit as audit_service
from .service.audit_location import AuditLocationService
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from auditor.serializers import ProfileInfoSerializer, BankInfoSerializer, AdditionalInfoSerializer, AuditorSerializer

class ClientView(APIView):
    def get(self, request, format=None):
        try:
            client = Client.objects.all()
            return Response(ClientSerializer(client, many=True).data)
        except Client.DoesNotExist:
            raise Http404

    def post(self, request):
        client_s = ClientSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.create()
        savedClient = ClientService().save(client)
        return Response(ClientSerializer(savedClient).data)

class ClientIdView(APIView):
    def get(self, request, client_id, format=None):
        try:
            client = Client.objects.get(id=client_id)
            return Response(ClientSerializer(client).data)
        except Client.DoesNotExist:
            raise Http404

    def post(self, request, client_id):
        client_s = ClientSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.create(id=client_id)
        savedClient = ClientService().save(client)
        return Response(ClientSerializer(savedClient).data)
    def delete(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            client.delete()
            return Response(ClientSerializer(client).data)
        except Client.DoesNotExist:
            raise Http404

class CityView(APIView):
    def get(self, request, format=None):
        cities = City.objects.all()
        return Response(CitySerializer(cities, many=True).data)

class LocationView(APIView):
    def get(self, request, format=None):
        try:
            location = Location.objects.all()
            return Response(LocationSerializer(location, many=True).data)
        except Location.DoesNotExist:
            return Http404

    def post(self, request):
        location_ds = LocationDeSerializer(data=request.data)
        location_ds.is_valid(raise_exception=True)
        location = location_ds.deserialize()
        savedLocation = LocationService().save(location)
        return Response(LocationSerializer(savedLocation).data)

class LocationIdView(APIView):
    def get(self, request, location_id, format=None):
        try:
            location = Location.objects.get(id=location_id)
            return Response(LocationSerializer(location).data)
        except Location.DoesNotExist:
            return Http404

    def post(self, request, location_id):
        location_ds = LocationDeSerializer(data=request.data)
        location_ds.is_valid(raise_exception=True)
        location = location_ds.deserialize(id=location_id)
        savedLocation = LocationService().save(location)
        return Response(LocationSerializer(savedLocation).data)

    def delete(self, request, location_id):
        try:
            location = Location.objects.get(location_id)
            location.delete()
            return Response(LocationSerializer(location).data)
        except Location.DoesNotExist:
            raise Http404

class AuditView(APIView):
    def get(self, request, format=None):
        audit = Audit.objects.all()
        return Response(AuditSerializer(audit, many=True).data)

    def post(self, request):
        audit_ds = AuditDeSerializer(data=request.data)
        audit_ds.is_valid(raise_exception=True)
        audit = audit_ds.deserialize()
        savedAudit = audit_service.save(audit)
        return Response(AuditSerializer(savedAudit).data)

class AuditIdView(APIView):
    def get(self, request, audit_id, format=None):
        try:
            audit = Audit.objects.get(id=audit_id)
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            return Http404

    def post(self, request, audit_id):
        audit_ds = AuditDeSerializer(data=request.data)
        audit_ds.is_valid(raise_exception=True)
        audit = audit_ds.deserialize(id=audit_id)
        savedAudit = audit_service.save(audit)
        return Response(AuditSerializer(savedAudit).data)

    def delete(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
            audit.delete()
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            return Http404

class AuditLocationView(APIView):
    def get(self, request, audit_id, format=None):
        try:
            auditLocation = AuditLocation.objects.all()
            return Response(AuditLocationSerializer(auditLocation, many=True).data)
        except AuditLocation.DoesNotExist:
            return Http404

    def post(self, request, audit_id):
        auditlocation_ds = AuditLocationDeSerializer(data=request.data)
        auditlocation_ds.is_valid(raise_exception=True)
        auditlocation = auditlocation_ds.create()
        saved_auditlocation = AuditLocationService().save(auditlocation)
        return Response(AuditLocationSerializer(saved_auditlocation).data)

class AuditLocationIdView(APIView):
    def get(self, request, audit_id, auditlocation_id, format=None):
        try:
            auditLocation = AuditLocation.objects.get(id=auditlocation_id)
            return Response(AuditLocationSerializer(auditLocation).data)
        except AuditLocation.DoesNotExist:
            return Http404

    def post(self, request, audit_id, auditlocation_id):
        auditlocation_ds = AuditLocationDeSerializer(data=request.data, context={'id':auditlocation_id})
        auditlocation_ds.is_valid(raise_exception=True)
        auditlocation = auditlocation_ds.create(id=auditlocation_id)
        saved_auditlocation = AuditLocationService().save(auditlocation)
        return Response(AuditLocationSerializer(saved_auditlocation).data)

    def delete(self, request, auditlocation_id):
        try:
            auditLocation = AuditLocation.objects.get(id=auditlocation_id)
            auditLocation.delete()
            return Response(AuditLocationSerializer(auditLocation).data)
        except AuditLocation.DoesNotExist:
            return Http404


class AuditorView(APIView):
    def get(self, request, format=None):
        auditors = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.all();
        return Response(AuditorSerializer(auditors, many=True).data)

class AuditorIdView(APIView):
    def get(self, request, auditor_id, format=None):
        auditor = User.objects.get(id=auditor_id);
        return Response(AuditorSerializer(auditor).data)

class AuditorProfileInfoView(APIView):
    def get(self, request, auditor_id, format=None):
        try:
            profileInfo = ProfileInfo.objects.get(user_id=auditor_id)
            return Response(ProfileInfoSerializer(profileInfo).data)
        except ProfileInfo.DoesNotExist:
            return Response(ProfileInfoSerializer(ProfileInfo(user_id=auditor_id)).data)

class AuditorBankInfoView(APIView):
    def get(self, request, auditor_id, format=None):
        try:
            bankInfo = BankInfo.objects.get(user_id=auditor_id)
            return Response(BankInfoSerializer(bankInfo).data)
        except BankInfo.DoesNotExist:
            return Response(BankInfoSerializer(BankInfo(user_id=auditor_id)).data)

class AuditorAdditionalInfoView(APIView):
    def get(self, request, auditor_id, format=None):
        try:
            additionalInfo = AdditionalInfo.objects.get(user_id=auditor_id)
            return Response(AdditionalInfoSerializer(additionalInfo).data)
        except AdditionalInfo.DoesNotExist:
            return Response(AdditionalInfoSerializer(AdditionalInfo(user_id=auditor_id)).data)

