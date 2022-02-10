from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, DateField, IntegerField

from ..serializers import AuditApplicationSerializer

from auditor.service import application_service

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

class AuditApplicationsByAuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, audit_id, format=None):
        applications = application_service.find_applications_by_audit(audit_id)
        return Response(AuditApplicationSerializer(applications, many=True).data)

class AuditApplicationIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, application_id, format=None):
        application = application_service.find_application_by_id(application_id)
        return Response(AuditApplicationSerializer(application).data)


class AuditApplicationApproveView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    class DeSerializer(Serializer):
        audit_date = DateField()
        reimbursement = IntegerField()
        earnings_per_audit = IntegerField()
        audit_count = IntegerField()

    def post(self, request, application_id, format=None):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        application = application_service.approve(
            application_id,
            ds.validated_data['audit_date'],
            ds.validated_data["reimbursement"],
            ds.validated_data["earnings_per_audit"],
            ds.validated_data["audit_count"],
            request.user,
        )
        return Response(AuditApplicationSerializer(application).data)


class AuditApplicationRejectView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, application_id, format=None):
        application = application_service.reject(application_id, request.user)
        return Response(AuditApplicationSerializer(application).data)


class AuditApplicationWaitListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, application_id, format=None):
        application = application_service.waitlist(application_id, request.user)
        return Response(AuditApplicationSerializer(application).data)


class AuditApplicationCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, application_id, format=None):
        application = application_service.set_application_comment(application_id, request.data.get('comment'))
        return Response(AuditApplicationSerializer(application).data)