from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Client, Audit, Location, AuditLocation, City
from .serializers import ClientSerializer, LocationSerializer, AuditSerializer, AuditLocationSerializer

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
        client = client_s.save()
        return Response(ClientSerializer(client).data)

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
        location = location_s.save(city=request.data['city_id'])
        return Response(LocationSerializer(location).data)

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
        audit = audit_s.save(client=request.data['client_id'])
        return Response(AuditSerializer(audit).data)

class AuditLocationView(APIView):
    def get(self, request, format=None):
        try:
            audit_location = AuditLocation.objects.all()
            return Response(AuditLocationSerializer(audit_location, many=True).data)
        except AuditLocation.DoesNotExist:
            return Http404

    def post(self, request):
        audit_location_s = AuditLocationSerializer(data=request.data)
        audit_location_s.is_valid(raise_exception=True)
        audit_location = audit_location_s.save(audit=request.data['audit_id'], location=request.data['location_id'])
        return Response(AuditLocationSerializer(audit_location).data)

