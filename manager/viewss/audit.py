from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..service import audit as manager_audit_service
from ..serializers import AuditSerializer, AuditDeSerializer, AuditFiatAssignDeSerializer, AuditStoreSerializer
from audit.service import audit_service
from auditor.service import application_service

class AuditByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        audits = audit_service.find_audits_by_audit_cycle_id(audit_cycle_id)
        serial_audits = AuditSerializer(audits, many=True).data
        return Response(serial_audits)

class AuditIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_id, format=None):
        audit = audit_service.find_audit_by_id(audit_id)
        return Response(AuditSerializer(audit).data)

    def post(self, request, audit_id):
        try:
            audit_ds = AuditDeSerializer(data=request.data, context={'id':audit_id})
            audit_ds.is_valid(raise_exception=True)
            audit = audit_ds.deserialize()
            audit = audit_service.save(audit)
            return Response(AuditSerializer(audit).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

    def delete(self, request, audit_id):
        audit_service.delete(audit_id)
        return HttpResponse(status=204)

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        try:
            audit_ds = AuditDeSerializer(data=request.data)
            audit_ds.is_valid(raise_exception=True)
            audit = audit_ds.deserialize()
            audit_service.save(audit)
            return Response(AuditSerializer(audit).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditFiatAssignView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, audit_id):
        try:
            request.data["audit"] = audit_id
            audit_f_assign_ds = AuditFiatAssignDeSerializer(data=request.data)
            audit_f_assign_ds.is_valid(raise_exception=True)
            audit_store = manager_audit_service.fiat_assign(
                audit_f_assign_ds.validated_data["audit"].id,
                audit_f_assign_ds.validated_data["email"],
                audit_f_assign_ds.validated_data["audit_date"],
                request.user
            )
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, to_audit_cycle_id, format=None):
        audits = audit_service.copy_audits_from_to(request.data.get('from_audit_cycle_id'), to_audit_cycle_id)
        return Response(AuditSerializer(audits, many=True).data)


class AuditRejectAllApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_id):
        rejected_applications = application_service.reject_all_applications_for_audit(audit_id, request.user)
        return Response(len(rejected_applications))
