from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit_store.models import AuditStore
from audit_store import service as audit_store_service

from client_report.service import xlsx_report as xlsx_report_service

from audit.models import Audit, AuditCycle
from ..serializers import AuditStoreSerializerWithPayment, AuditStoreDeSerializer

class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audit_stores = audit_store_service.find_by_audit_cycle(audit_cycle_id)
            serial_audit_stores = AuditStoreSerializerWithPayment(audit_stores, many=True).data
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

class AuditStoreIdAuditDateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }

    class DeSerializer(Serializer):
        audit_date = serializers.DateField()

    def post(self, request, audit_store_id):
        try:
            ds = AuditStoreIdAuditDateView.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            audit_store = audit_store_service.set_audit_date(audit_store_id, ds.validated_data['audit_date'])
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e

class AuditStoreIdWithdrawView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.withdraw(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditStoreIdCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.complete(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreIdUnCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.uncomplete(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditStoreIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.fail(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.submit_by_manager(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreIdUnSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.unsubmit(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, audit_store_id, format=None):
        try:
            report, name = xlsx_report_service.get_xlsx_report(audit_store_id, client_id)
            response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="' + name + '"'
            return response
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404
