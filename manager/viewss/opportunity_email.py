from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import OpportunityEmailRecordSerializer
from notify.service import mail_opportunity as mail_opportunity_service

class OpportunityEmailRecordView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        opps = mail_opportunity_service.find_opportunity_email_records_by_audit_cycle(audit_cycle_id)
        return Response(OpportunityEmailRecordSerializer(opps, many=True).data)

    def post(self, request, audit_cycle_id):
        opp = mail_opportunity_service.schedule_opportunity_emails_for_audit_cycle_and_city(audit_cycle_id, request.data.get('city_id', None))
        return Response(OpportunityEmailRecordSerializer(opp).data)

