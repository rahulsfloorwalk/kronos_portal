from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, IntegerField, CharField,ListField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit_store.models import AuditStore
from auditor.models import AuditorRating
from audit_store import service as audit_store_service
from audit_store import service_manager
from ..service import moderator as moderator_service
from auditor.service import profile_info_service
from rest_framework.permissions import AllowAny,IsAuthenticated
from attachment import service_auditor


from attachment.service import set_attachment_by_proof_tag

from client_report.service import xlsx_report as xlsx_report_service

from ..serializers import AuditStoreFollowUpSerializer, AuditStoreSerializer, AuditStoreSerializerWithoutAudit, AuditStoreSerializerWithUser,AuditProoftagSerializer

class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_store_service.find_by_audit_cycle(audit_cycle_id)
        serial_audit_stores = AuditStoreSerializerWithoutAudit(audit_stores, many=True).data
        return Response(serial_audit_stores)


class UserListForReportsFilter(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id, format=None):
        user_list = audit_store_service.find_by_audit_cycle_distinct_user(audit_cycle_id)
        return Response(AuditStoreSerializerWithUser(user_list, many=True).data)


class AuditStoreByAuditCycleNew(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_store_service.find_by_audit_cycle_new(audit_cycle_id,
                                                                   request.GET.get('lastAuditId'),
                                                                   request.GET.get('status'),
                                                                   request.GET.get('userId'),
                                                                   request.GET.get('start_date'),
                                                                   request.GET.get('end_date'),
                                                                   request.GET.get('is_load_more'),
                                                                   request.GET.get('last_total_count'))
        return Response(audit_stores)

class AuditStoreListByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_store_service.find_audit_store_by_audit_cycle_id(audit_cycle_id,
                                                                   request.GET.get('lastAuditId'),
                                                                   request.GET.get('status'),
                                                                   request.GET.get('userId'),
                                                                   request.GET.get('qa_userId'),
                                                                   request.GET.get('city'),
                                                                   request.GET.get('start_date'),
                                                                   request.GET.get('end_date'),
                                                                   request.GET.get('is_load_more'),
                                                                   request.GET.get('last_total_count'))
        return Response(audit_stores)

class AuditStoreCityListByAuditCycle(APIView):
    permission_classes = [AllowAny]
    # required_groups = {
    #     'GET': [GROUP_NAME_MANAGER],
    # }

    def get(self, request, audit_cycle_id, format=None):
        user_id = request.user.id
        audit_stores = audit_store_service.find_audit_store_city_by_audit_cycle_id(audit_cycle_id,user_id)
        return Response(audit_stores)

class AuditListByAuditCycleAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id,audit_store_id, format=None):
        audit_stores = audit_store_service.find_audit_by_audit_cycle_audit_store_id(audit_cycle_id,audit_store_id,
                                                                   request.GET.get('lastAuditId'),
                                                                   request.GET.get('status'),
                                                                   request.GET.get('userId'),
                                                                   request.GET.get('qa_userId'),
                                                                   request.GET.get('city'),
                                                                   request.GET.get('start_date'),
                                                                   request.GET.get('end_date'),
                                                                   request.GET.get('is_load_more'),
                                                                   request.GET.get('last_total_count'))
        return Response(audit_stores)


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


class AuditStoreIdCheckPoints(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_check_points(audit_store_id, request.data['check_points'])
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdFollowUp(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, audit_store_id):
        follow_up = audit_store_service.get_follow_up_by_audit_store(audit_store_id)
        return Response(AuditStoreFollowUpSerializer(follow_up).data)

    def post(self, request, audit_store_id):
        follow_up = audit_store_service.set_follow_up_by_audit_store(audit_store_id, request.data.get('comment'), request.data.get('next_follow_up_date'), request.user.id)
        return Response(AuditStoreFollowUpSerializer(follow_up).data)


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

# class AuditStoreIdQARatingView(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'POST': [GROUP_NAME_MANAGER],
#     }

#     class DeSerializer(Serializer):
#         qa_rating = serializers.ChoiceField(AuditStore.QA_RATING)

#     def post(self, request, audit_store_id):
#         ds = self.DeSerializer(data=request.data)
#         ds.is_valid(raise_exception=True)
#         audit_store = get_object_or_404(AuditStore, pk=audit_store_id)
#         audit_store.rate(ds.validated_data['qa_rating'])
#         return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdQARatingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        qa_rating = serializers.ChoiceField(AuditStore.QA_RATING)
        qa_feedback_rating = ListField(required=False, allow_empty=True)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = get_object_or_404(AuditStore, pk=audit_store_id)
        # audit_store.rate(ds.validated_data['qa_rating'])
        qa_rating = ds.validated_data['qa_rating']
        qa_feedback_rating = ds.validated_data.get('qa_feedback_rating')
        audit_store.rate(qa_rating, qa_feedback_rating)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreAuditorRatingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    class DeSerializer(Serializer):
        auditor_rating = serializers.ChoiceField(AuditorRating.RATING)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = get_object_or_404(AuditStore, pk=audit_store_id)
        profile_info_service.save_auditor_rating(audit_store.user, ds.validated_data['auditor_rating'])
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


class AuditStoreIdRevertReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.revert_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_store_id):
        audit_store = service_manager.submit_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreProofTagNotAvailableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        # 'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_store_id, format=None):
            prooftag_not_available = service_auditor.find_by_audit_store_for_auditor_prooftag_not_available_for_moderator(audit_store_id)
            return Response(AuditProoftagSerializer(prooftag_not_available, many=True).data)

    # def post(self, request, audit_store_id):
    #     proof_tag = request.data.get('proof_tag_id')
    #     description = request.data.get('description')
    #     user_id = request.user.id
    #     try:
    #         prooftag_not_available = service_auditor.upload_prooftag_not_available_for_audit_store_by_auditor_moderator(
    #             audit_store_id,
    #             user_id,
    #             proof_tag,
    #             description)
    #         return Response(AuditProoftagSerializer(prooftag_not_available).data)
    #     except KeyError as e:
    #         return Response( {"message": str(e)},status=400 )

class AuditStoreIdArrangeAttachment(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_service.find_by_id(audit_store_id)
        set_attachment_by_proof_tag(audit_store_id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdUnSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        reason = CharField(allow_blank=True)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = service_manager.revert_submit_report(audit_store_id, request.user.id, ds.validated_data['reason'])
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
    # permission_classes = [HasGroupPermission]
    # required_groups = {
    #     'GET': [GROUP_NAME_MANAGER],
    # }
    def get(self, request, client_id, audit_store_id, format=None):
        report, name = xlsx_report_service.get_xlsx_report_for_manager(audit_store_id)
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
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        count = audit_store_service.accept_all_audit_stores(audit_cycle_id, request.user, start_date, end_date)
        return Response(count)