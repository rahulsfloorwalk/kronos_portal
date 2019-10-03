from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, IntegerField, CharField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit_store.models import AuditStore
from audit_store import service as audit_store_service
from audit_store import service_manager
from ..service import moderator as moderator_service


from client_report.service import xlsx_report as xlsx_report_service

from ..serializers import AuditStoreSerializer, AuditStoreSerializerWithoutAudit

class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_store_service.find_by_audit_cycle(audit_cycle_id)
        serial_audit_stores = AuditStoreSerializerWithoutAudit(audit_stores, many=True).data
        return Response(serial_audit_stores)

class AuditStoreByAudit(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_id, format=None):
        audit_stores = audit_store_service.find_by_audit(audit_id)
        return Response(AuditStoreSerializerWithoutAudit(audit_stores, many=True).data)

class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_store_id, format=None):
        audit_store = audit_store_service.find_by_id(audit_store_id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdAuditDateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        audit_date = serializers.DateField()

    def post(self, request, audit_store_id):
        ds = AuditStoreIdAuditDateView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.set_audit_date(audit_store_id, ds.validated_data['audit_date'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdModeratorStatusView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_moderator_status(audit_store_id, request.data['moderator_status'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdModeratorCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_moderator_comment(audit_store_id, request.data['moderator_comment'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdReportSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    class ReportSummaryDeSerializer(Serializer):
        report_summary = CharField(max_length=16348, allow_blank=True)

    def post(self, request, audit_store_id, format=None):
        ds = AuditStoreIdReportSummaryView.ReportSummaryDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_summary = ds.validated_data['report_summary']
        audit_store = service_manager.set_report_summary(audit_store_id, report_summary, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdReimbursementView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        reimbursement = serializers.IntegerField()

    def post(self, request, audit_store_id):
        ds = AuditStoreIdReimbursementView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = service_manager.set_reimbursement(audit_store_id, ds.validated_data['reimbursement'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdEarningsPerAuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        earnings_per_audit = serializers.IntegerField()

    def post(self, request, audit_store_id):
        ds = AuditStoreIdEarningsPerAuditView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = service_manager.set_earnings_per_audit(audit_store_id, ds.validated_data['earnings_per_audit'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdQARatingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        qa_rating = serializers.ChoiceField(AuditStore.QA_RATING)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = get_object_or_404(AuditStore, pk=audit_store_id)
        audit_store.rate(ds.validated_data['qa_rating'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdReportAttributeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        json_id = serializers.CharField()
        option_id = serializers.CharField()

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = service_manager.set_report_attribute_value(
            audit_store_id,
            ds.validated_data["json_id"],
            ds.validated_data["option_id"],
            request.user.id,
        )
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdWithdrawView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.withdraw_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdQAOKView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.qa_ok_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdPMRevertView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.pm_revert_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.complete_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdUnCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.revert_complete_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        message = CharField()


    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = service_manager.fail_report(audit_store_id, request.user.id, ds.validated_data['message'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.submit_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdUnSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.revert_submit_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdAcceptView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_service.accept(audit_store_id, request.user)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdRejectView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.reject_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreXlsxReport(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, audit_store_id, format=None):
        report, name = xlsx_report_service.get_xlsx_report(audit_store_id, client_id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

class AuditStoreIdClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        client_user_id = IntegerField()

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_store = audit_store_service.assign_audit_store_to_client_user(
            audit_store_id,
            ds.validated_data["client_user_id"],
        )
        return Response(AuditStoreSerializer(saved_audit_store).data)

    def delete(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_store = audit_store_service.revoke_audit_store_from_client_user(
            audit_store_id,
            ds.validated_data["client_user_id"],
        )
        return Response(AuditStoreSerializer(saved_audit_store).data)


class AuditStoreModeratorAssign(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        user_id = IntegerField()

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = moderator_service.assign_audit_store(
            ds.validated_data["user_id"],
            audit_store_id
        )
        return Response(AuditStoreSerializerWithoutAudit(audit_store).data)

    def delete(self, request, audit_store_id):
        audit_store = moderator_service.revoke_audit_store(
            audit_store_id
        )
        return Response(AuditStoreSerializerWithoutAudit(audit_store).data)


class AcceptAllCompletedForAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_cycle_id, format=None):
        count = audit_store_service.accept_all_audit_stores(audit_cycle_id, request.user)
        return Response(count)

