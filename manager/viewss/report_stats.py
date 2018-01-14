from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from client_report.service import audit_section

class AuditCycleStoreSectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, store_id, format=None):
        mean_marks = audit_section.get_store_section_aggregation_for_manager(audit_cycle_id, store_id)
        return Response(mean_marks)

class AuditCycleCitySectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        mean_marks = audit_section.get_city_section_aggregation_for_manager(audit_cycle_id, city_id)
        return Response(mean_marks)
