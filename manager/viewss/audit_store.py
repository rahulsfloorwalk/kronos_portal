from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, IntegerField

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit_store.models import AuditStore
from audit_store import service as audit_store_service

from payment.service import payment_manager as payment_service

from client.service import client_user as client_user_service
from client_report.service import xlsx_report as xlsx_report_service

from audit.models import Audit, AuditCycle
from ..serializers import AuditStoreSerializer, AuditStoreSerializerWithPayment, AuditStoreDeSerializer

class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        try:
            audit_stores = audit_store_service.find_by_audit_cycle(audit_cycle_id)
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
        audit_store = audit_store_service.find_by_id(audit_store_id)
        return Response(AuditStoreSerializer(audit_store).data)

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

class AuditStoreIdAcceptView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    class DeSerializer(Serializer):
        payment_amount = IntegerField()
    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.accept(audit_store_id, ds.validated_data['payment_amount'], request.user)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdRejectView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.reject(audit_store_id, request.user)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreIdPayView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_store_id):
        try:
            audit_store = payment_service.pay_for_audit_store(audit_store_id, request.user)
            return Response(AuditStoreSerializerWithPayment(audit_store).data)
        except (AppLogicError) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditStoreIdUnpayView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_store_id):
        try:
            audit_store = payment_service.unpay_for_audit_store(audit_store_id, request.user)
            return Response(AuditStoreSerializerWithPayment(audit_store).data)
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


class AuditStoreIdClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        client_user_id = IntegerField()

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_store = audit_store_service.assign_audit_store_to_client_user(
                audit_store_id,
                ds.validated_data["client_user_id"],
            )
        return Response(AuditStoreSerializer(saved_audit_store).data)

    def delete(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_store = audit_store_service.revoke_audit_store_from_client_user(
                audit_store_id,
                ds.validated_data["client_user_id"],
            )
        return Response(AuditStoreSerializer(saved_audit_store).data)
