from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer, PrimaryKeyRelatedField, EmailField, DateField, IntegerField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from audit.models import Audit

from ..service import audit as manager_audit_service
from ..serializers import AuditSerializer, AuditStoreSerializer
from audit.service import audit_service
from auditor.service import application_service

class AuditDeSerializer(ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'audit_date',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'post_approval_description',
        )
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit = Audit.objects.get(id=self.context.get('id'))
        else:
            audit = Audit()
        audit.count = self.validated_data.get('count', audit.count)
        audit.audit_date = self.validated_data.get('audit_date', audit.audit_date)
        audit.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit.earnings_per_audit)
        audit.reimbursement = self.validated_data.get('reimbursement', audit.reimbursement)
        audit.store = self.validated_data.get('store', audit.store_id)
        audit.audit_cycle = self.validated_data.get('audit_cycle', audit.audit_cycle_id)
        audit.post_approval_description = self.validated_data.get('post_approval_description', audit.post_approval_description)
        return audit


class AuditFiatAssignDeSerializer(Serializer):
    audit = PrimaryKeyRelatedField(queryset=Audit.objects.all())
    email = EmailField()
    audit_date = DateField()
    earnings_per_audit = IntegerField()
    reimbursement = IntegerField()
    audit_count = IntegerField()

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
        audit_ds = AuditDeSerializer(data=request.data, context={'id':audit_id})
        audit_ds.is_valid(raise_exception=True)
        audit = audit_ds.deserialize()
        audit = audit_service.save(audit)
        return Response(AuditSerializer(audit).data)

    def delete(self, request, audit_id):
        audit_service.delete(audit_id)
        return HttpResponse(status=204)

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        if request.data['audit_region'] == 'state':
            audit = audit_service.create_audit_by_state(request.data)
            audit = audit[0] if audit else audit
        elif request.data['audit_region'] == 'city':
            audit_ds = AuditDeSerializer(data=request.data)
            audit_ds.is_valid(raise_exception=True)
            audit = audit_ds.deserialize()
            audit = audit_service.save(audit)
        return Response(AuditSerializer(audit).data)


class AuditFiatAssignView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, audit_id):
        request.data["audit"] = audit_id
        audit_f_assign_ds = AuditFiatAssignDeSerializer(data=request.data)
        audit_f_assign_ds.is_valid(raise_exception=True)
        audit_store = manager_audit_service.fiat_assign(
            audit_f_assign_ds.validated_data["audit"].id,
            audit_f_assign_ds.validated_data["email"],
            audit_f_assign_ds.validated_data["audit_date"],
            audit_f_assign_ds.validated_data["reimbursement"],
            audit_f_assign_ds.validated_data["earnings_per_audit"],
            audit_f_assign_ds.validated_data["audit_count"],
            request.user
        )
        return Response(AuditStoreSerializer(audit_store, many=True).data)


class AuditHiddenView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_id):
        audit = audit_service.hide_audit(audit_id)
        return Response(AuditSerializer(audit).data)
    def delete(self, request, audit_id):
        audit = audit_service.unhide_audit(audit_id)
        return Response(AuditSerializer(audit).data)


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
