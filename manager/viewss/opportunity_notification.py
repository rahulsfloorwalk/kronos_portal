from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from notify.service import opportunity_notification as opportunity_notification_service


class OpportunityNotificationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_cycle_id):
        opportunity_notification_service.opportunity_notification_service(audit_cycle_id, request.data)
        return Response()