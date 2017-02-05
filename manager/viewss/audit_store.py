from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group
from kronos.exceptions import ObjectNotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

#from client.service import store as store_service

from audit_store.models import AuditStore
from audit.models import Audit, AuditCycle
from ..serializers import AuditStoreSerializer, AuditStoreDeSerializer
from ..service import audit_store as audit_store_service
class AuditStoreByAudit(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_id, format=None):
        try:
            audit_stores = AuditStore.objects.filter(audit_id=audit_id).all()
            serial_audit_stores = AuditStoreSerializer(audit_stores, many=True).data
            return Response(serial_audit_stores)
        except AuditStore.DoesNotExist:
            raise Http404

class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audit_stores = audit_store_service.get_audit_stores(audit_cycle_id)
            serial_audit_stores = AuditStoreSerializer(audit_stores, many=True).data
            return Response(serial_audit_stores)
        except ObjectNotFound:
            raise Http404

class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            audit_store = AuditStore.objects.get(pk=audit_store_id)
            audit_store_serial = AuditStoreSerializer(audit_store).data
            return Response(audit_store_serial)
        except AuditStore.DoesNotExist:
            return Http404

    def post(self, request, audit_store_id):
        audit_store_ds = AuditStoreDeSerializer(data=request.data, context={'id':audit_store_id})
        audit_store_ds.is_valid(raise_exception=True)
        audit_store = audit_ds.deserialize()
        savedAuditStore = audit_store.save()
        audit_store_serial = AuditStoreSerializer(savedAuditStore).data
        return Response(audit_store_serial)

    def delete(self, request, audit_store_id):
        try:
            audit_store = AuditStore.objects.get(audit_store_id)
            audit_store.delete()
            audit_store_serial = AuditStoreSerializer(audit_store).data
            return Response(audit_store_serial)
        except Audit.DoesNotExist:
            raise Http404

class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request):
        audit_store_ds = AuditStoreDeSerializer(data=request.data)
        audit_store_ds.is_valid(raise_exception=True)
        audit_store = audit_store_ds.deserialize()
        savedAuditStore = audit_store.save()
        audit_store_serial = AuditStoreSerializer(savedAuditStore).data
        return Response(audit_store_serial)
