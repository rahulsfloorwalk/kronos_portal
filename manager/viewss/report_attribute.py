from rest_framework.views import APIView
from rest_framework.serializers import ModelSerializer, Serializer, JSONField, CharField
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit.models import ReportAttribute
from audit.service import report_attribute_service


class ReportAttributeSerializer(ModelSerializer):
    class Meta:
        model = ReportAttribute
        fields = (
            'id',
            'json_id',
            'label',
            'audit_cycle_id',
            'attribute_data',
        )
        read_only_fields = fields


class ReportAttributeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id):
        report_attributes = report_attribute_service.find_report_attributes_by_audit_cycle_id(audit_cycle_id)
        return Response(ReportAttributeSerializer(report_attributes, many=True).data)

    class DeSerializer(Serializer):
        label = CharField()
        attribute_data = JSONField()

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        label = ds.validated_data["label"]
        attribute_data = ds.validated_data["attribute_data"]
        report_attribute = report_attribute_service.create_report_attribute(int(audit_cycle_id), label, attribute_data)
        return Response(ReportAttributeSerializer(report_attribute).data)
