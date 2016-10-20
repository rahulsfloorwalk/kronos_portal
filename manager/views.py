from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Client, Audit, Location, AuditLocation, City
from .serializers import ClientSerializer, AuditSerializer, AuditLocationSerializer, CitySerializer
from .serializers import LocationSerializer, LocationDeSerializer
from .service.client import ClientService
from .service.location import LocationService
from .service.audit import AuditService
from .service.audit_location import AuditLocationService

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
        location_s = LocationSerializer(data=request.data)
        location_s.is_valid(raise_exception=True)
        location = location_s.create()
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
        location_s = LocationDeSerializer(data=request.data)
        location_s.is_valid(raise_exception=True)
        location = location_s.deserialize(id=location_id)
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
        try:
            audit = Audit.objects.all()
            return Response(AuditSerializer(audit, many=True).data)
        except Audit.DoesNotExist:
            return Http404

    def post(self, request):
        audit_s = AuditSerializer(data=request.data)
        audit_s.is_valid(raise_exception=True)
        audit = audit_s.create()
        savedAudit = AuditService().save(audit)
        return Response(AuditSerializer(savedAudit).data)

class AuditIdView(APIView):
    def get(self, request, audit_id, format=None):
        try:
            audit = Audit.objects.get(id=audit_id)
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            return Http404

    def post(self, request, audit_id):
        audit_s = AuditSerializer(data=request.data)
        audit_s.is_valid(raise_exception=True)
        audit = audit_s.create(id=audit_id)
        savedAudit = AuditService().save(audit)
        return Response(AuditSerializer(savedAudit).data)

    def delete(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
            audit.delete()
            return Response(AuditSerializer(audit).data)
        except Audit.DoesNotExist:
            return Http404

class AuditLocationView(APIView):
    def get(self, request, format=None):
        try:
            auditLocation = AuditLocation.objects.all()
            return Response(AuditLocationSerializer(auditLocation, many=True).data)
        except AuditLocation.DoesNotExist:
            return Http404

    def post(self, request):
        auditLocation_s = AuditLocationSerializer(data=request.data)
        auditLocation_s.is_valid(raise_exception=True)
        auditLocation = auditLocation_s.create()
        savedAuditLocation = AuditLocationService().save(auditLocation)
        return Response(AuditLocationSerializer(savedAuditLocation).data)

class AuditLocationIdView(APIView):
    def get(self, request, audit_location_id, format=None):
        try:
            auditLocation = AuditLocation.objects.get(id=audit_location_id)
            return Response(AuditLocationSerializer(auditLocation).data)
        except AuditLocation.DoesNotExist:
            return Http404

    def post(self, request, audit_location_id):
        auditLocation_s = AuditLocationSerializer(data=request.data)
        auditLocation_s.is_valid(raise_exception=True)
        auditLocation = auditLocation_s.create(id=audit_location_id)
        savedAuditLocation = AuditLocationService().save(auditLocation)
        return Response(AuditLocationSerializer(savedAuditLocation).data)

    def delete(self, request, audit_location_id):
        try:
            auditLocation = AuditLocation.objects.get(id=audit_location_id)
            auditLocation.delete()
            return Response(AuditLocationSerializer(auditLocation).data)
        except AuditLocation.DoesNotExist:
            return Http404
