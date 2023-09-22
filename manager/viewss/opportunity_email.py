from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.service import opportunity_email as opportunity_email_service
from manager.serializers import CitySerializer
from notify.models import OpportunityEmailRecord, OpportunitySmsRecord, OpportunityWhatsappRecord
from notify.service import mail_opportunity as mail_opportunity_service

class OpportunityEmailRecordSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = OpportunityEmailRecord
        fields = (
            'id',
            'audit_cycle_id',
            'city',
            'total_count',
            'progress_count',
            'created_at',
            'modified_at',
        )
        read_only_fields = fields


class OpportunitySMSRecordSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = OpportunitySmsRecord
        fields = (
            'id',
            'audit_cycle_id',
            'city',
            'total_count',
            'progress_count',
            'created_at',
            'modified_at',
        )
        read_only_fields = fields


class OpportunityWhatsappRecordSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = OpportunityWhatsappRecord
        fields = (
            'id',
            'audit_cycle_id',
            'city',
            'total_count',
            'progress_count',
            'created_at',
            'modified_at',
        )
        read_only_fields = fields


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
        opp = mail_opportunity_service.schedule_opportunity_emails_for_audit_cycle_with_filters(audit_cycle_id, request.data)
        return Response(OpportunityEmailRecordSerializer(opp).data)


class AuditorCountByFilterView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        count = opportunity_email_service.get_auditor_count_by_filter(request.data)
        return Response({'count': count})

# class AuditorAllLocationCountByFilterView(APIView):
#     permission_classes = [HasGroupPermission]
    

class OpportunitySMSRecordView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        opps = mail_opportunity_service.find_opportunity_sms_records_by_audit_cycle(audit_cycle_id)
        return Response(OpportunitySMSRecordSerializer(opps, many=True).data)


class OpportunityWhatsappRecordView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        opps = mail_opportunity_service.find_opportunity_whatsapp_records_by_audit_cycle(audit_cycle_id)
        return Response(OpportunityWhatsappRecordSerializer(opps, many=True).data)