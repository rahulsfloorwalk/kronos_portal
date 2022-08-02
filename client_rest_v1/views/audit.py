from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from registration.models import GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission
from audit.models import Audit

from ..serializers import AuditSerializer
from audit.service import audit_service
from kronos.exceptions import AppLogicError

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


class AuditByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        audits = audit_service.find_audits_by_audit_cycle_id(audit_cycle_id)
        serial_audits = AuditSerializer(audits, many=True).data
        return Response(serial_audits)

    def post(self, request, audit_cycle_id):
        audit_data = request.data.get('audit_data', '')
        if audit_data:
            audit_service.add_bulk_audit(audit_data['client_id'], audit_cycle_id, audit_data['audits'])
        else:
            raise AppLogicError("Please select data")
        return Response(status=201)

class AuditIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
        'DELETE': [GROUP_NAME_CLIENT]
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
        'POST': [GROUP_NAME_CLIENT]
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


class AuditCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
    }
    def post(self, request, to_audit_cycle_id, format=None):
        audits = audit_service.copy_audits_from_to(request.data.get('from_audit_cycle_id'), to_audit_cycle_id)
        return Response(AuditSerializer(audits, many=True).data)