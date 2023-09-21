from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from audit.service import audit_cycle as audit_cycle_service
from notify.service import opportunity_notification as opportunity_notification_service
from audit.service import audit_service

class OpportunityNotificationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_cycle_id):
        opportunity_notification_service.opportunity_notification_service(audit_cycle_id, request.data)
        return Response()

class OpportunityNotificationForPincodeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_cycle_id):
        audit_alignment_factors = audit_cycle_service.get_audit_alignment_factor_by_audit_cycle(audit_cycle_id)
        audit_alignment_factors['channel_name'] = request.data['channel_name']
        if request.data.get('auditId'):
            audit=audit_service.find_audit_by_id(request.data['auditId'])
            audit_alignment_factors['city'] = str(audit.store.city.id)
            if audit.get_pincode_audit() is not None:
                audit_alignment_factors['pincode'] = audit.get_pincode_audit()
                opportunity_notification_service.opportunity_notification_service_for_pincode(audit_cycle_id,audit_alignment_factors)
        else:
            audit_alignment_factors['format'] = request.data.get('format')
            opportunity_notification_service.opportunity_notification_service_for_pincode(audit_cycle_id,audit_alignment_factors)
        return Response()