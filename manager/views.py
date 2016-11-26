from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, DateField

from .models import Client, Audit, Location, AuditLocation, City
from .serializers import ClientSerializer, AuditLocationSerializer, CitySerializer
from .serializers import AuditLocationSerializer, AuditLocationDeSerializer
from .serializers import LocationSerializer, LocationDeSerializer
from .serializers import AuditSerializer, AuditDeSerializer
from .serializers import AuditLocationApplicationSerializer
from .service import client as client_service
from .service import location as location_service
from .service import audit as audit_service
from .service import application as application_service
from .service import audit_location as audit_location_service
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo, AuditApplication
from auditor.serializers import ProfileInfoSerializer, BankInfoSerializer, AdditionalInfoSerializer, AuditorSerializer
from kronos.exceptions import AppLogicError, ObjectNotFound
from . import states

class ClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
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
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)

class ClientIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
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
        savedClient = client_service.save(client)
        return Response(ClientSerializer(savedClient).data)
    def delete(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            client.delete()
            return Response(ClientSerializer(client).data)
        except Client.DoesNotExist:
            raise Http404

class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class StateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, format=None):
        return Response(states.states)

class LocationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
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
        savedLocation = location_service.save(location)
        return Response(LocationSerializer(savedLocation).data)

class LocationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
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
        savedLocation = location_service.save(location)
        return Response(LocationSerializer(savedLocation).data)

    def delete(self, request, location_id):
        try:
            location = Location.objects.get(location_id)
            location.delete()
            return Response(LocationSerializer(location).data)
        except Location.DoesNotExist:
            raise Http404

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
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
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
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
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
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
        saved_auditlocation = audit_location_service.save(auditlocation)
        return Response(AuditLocationSerializer(saved_auditlocation).data)

class AuditLocationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
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
        saved_auditlocation = audit_location_service.save(auditlocation)
        return Response(AuditLocationSerializer(saved_auditlocation).data)

    def delete(self, request, auditlocation_id):
        try:
            auditLocation = AuditLocation.objects.get(id=auditlocation_id)
            auditLocation.delete()
            return Response(AuditLocationSerializer(auditLocation).data)
        except AuditLocation.DoesNotExist:
            return Http404



class AuditApplicationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, audit_id, format=None):
        try:
            applications = application_service.find_by_audit(audit_id)
            return Response(AuditLocationApplicationSerializer(applications, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditApplicationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, application_id, format=None):
        try:
            application = AuditApplication.objects.get(id=application_id)
            return Response(AuditLocationApplicationSerializer(application).data)
        except AuditApplication.DoesNotExist as e:
            raise NotFound from e


class AuditApplicationAssignView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    class DeSerializer(Serializer):
        audit_date = DateField()

    def post(self, request, application_id, format=None):
        try:
            ds = self.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            application = application_service.assign(application_id, ds.data['audit_date'])
            return Response(AuditLocationApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError(e) from e


class AuditApplicationRejectView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request, application_id, format=None):
        try:
            application = application_service.reject(application_id)
            return Response(AuditLocationApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError(e) from e


class AuditApplicationCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request, application_id, format=None):
        try:
            application = application_service.complete(application_id)
            return Response(AuditLocationApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError(e) from e


class AuditApplicationFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request, application_id, format=None):
        try:
            application = application_service.fail(application_id)
            return Response(AuditLocationApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError(e) from e
