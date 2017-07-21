from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, DateField

from audit.models import AuditCycle, Audit

from client.models import Client

from .models import Location, City

from .serializers import CitySerializer
from .serializers import AuditSerializer, AuditDeSerializer
from .serializers import LocationSerializer, LocationDeSerializer
from .serializers import AuditSerializer, AuditDeSerializer
from .serializers import AuditApplicationSerializer

from .service import location as location_service
import auditor.service.application_service
from .service import audit_location as audit_location_service

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from registration.service.auditor import deactivate_auditor, activate_auditor
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo, AuditApplication

from kronos.exceptions import AppLogicError, ObjectNotFound
from . import states


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
            city_id = request.GET['city_id']
            location = Location.objects.filter(city_id=city_id)
            return Response(LocationSerializer(location, many=True).data)
        except KeyError:
            raise ValidationError(detail="city_id is needed")

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
        location_ds = LocationDeSerializer(data=request.data, context={'id' : location_id})
        location_ds.is_valid(raise_exception=True)
        location = location_ds.deserialize()
        savedLocation = location_service.save(location)
        return Response(LocationSerializer(savedLocation).data)

    def delete(self, request, location_id):
        try:
            location = Location.objects.get(location_id)
            location.delete()
            return Response(LocationSerializer(location).data)
        except Location.DoesNotExist:
            raise Http404


class AuditApplicationApproveView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER]
        }
    class DeSerializer(Serializer):
        audit_date = DateField()

    def post(self, request, application_id, format=None):
        try:
            ds = self.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            application = application_service.approve(application_id, ds.validated_data['audit_date'], request.user)
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class AuditApplicationRejectView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request, application_id, format=None):
        try:
            application = application_service.reject(application_id, request.user)
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError(e) from e
