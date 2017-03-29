from django.http import HttpResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission

from client_report.service import audit_section

import json

class AuditCycleStoreSectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER, GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, store_id, format=None):
        try:
            mean_marks = audit_section.get_store_section_aggregation_for_manager(audit_cycle_id, store_id)
            return Response(mean_marks)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404

class AuditCycleCitySectionAverageReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET' : [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, city_id, format=None):
        try:
            mean_marks = audit_section.get_city_section_aggregation_for_manager(audit_cycle_id, city_id)
            return Response(mean_marks)
        except (ObjectNotFound, AppLogicError) as e:
            raise Http404
