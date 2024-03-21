from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer, DateField, CharField, IntegerField, BooleanField, ChoiceField, ListField
from client.service import client_service

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MODERATOR
from audit_store import service_manager
from audit_store.models import AuditStore
from auditor.models import AuditorRating
import audit.service.audit_cycle as audit_cycle_service
import audit.service.audit_cycle_proof_tag as audit_cycle_proof_tag_service
import audit_store.service_moderator as audit_store_service
import attachment.service_moderator as attachment_service
import questionnaire.service.section as section_service
import answer.service.report_section_moderator as report_section_moderator_service
import answer.service.answer_moderator as answer_moderator_service
from auditor.service import profile_info_service
from audit_store.service_auditor import set_not_applicable_for_hide_questions
from attachment.service import set_attachment_by_proof_tag

from .serializers import AuditCycleSerializer, ClientSerializer
from .serializers import AuditStoreSerializer, AuditStoreSerializerForList
from .serializers import AttachmentSerializer
from .serializers import SectionSerializer
from .serializers import ReportSectionSerializer
from .serializers import AnswerSerializer
# from .serializers import AuditCycleProoftagListSerializer


class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request):
        audit_cycles = audit_cycle_service.find_for_moderator(request.user.id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_cycle_id):
        audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, request.user.id)
        return Response(AuditCycleSerializer(audit_cycle).data)


class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_cycle_id):
        audit_stores = audit_store_service.find_by_audit_cycle_for_moderator(audit_cycle_id, request.user.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)


class AuditStoreCompletedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request):
        audit_stores, count = audit_store_service\
            .find_qa_completed_audit_stores_for_moderator(request.user.id, request.data['lastAuditStoreDate'],
                                                          request.data['filterStatus'], request.data.get('client_id'))
        return Response({"auditStores": AuditStoreSerializerForList(audit_stores, many=True).data, "count": count})


class AuditStorePendingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request):
        audit_stores, count = audit_store_service\
            .find_qa_pending_audit_stores_for_moderator(request.user.id, request.data['lastAuditStoreDate'],
                                                        request.data['filterStatus'], request.data.get('client_id'))
        return Response({"auditStores": AuditStoreSerializerForList(audit_stores, many=True).data, "count": count})


class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_store_id):
        audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdAuditDateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class DeSerializer(Serializer):
        audit_date = DateField()
    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.set_audit_date_for_moderator(audit_store_id, ds.validated_data['audit_date'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdModeratorStatusView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_moderator_status(audit_store_id,request.data['moderator_status'],request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdModeratorCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_moderator_comment(audit_store_id, request.data['moderator_comment'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdCheckPoints(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.set_check_points(audit_store_id, request.data['check_points'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdEarningsPerAuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class DeSerializer(Serializer):
        earnings_per_audit = IntegerField()
    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.set_earnings_per_audit_for_moderator(audit_store_id, ds.validated_data['earnings_per_audit'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdReportSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    class ReportSummaryDeSerializer(Serializer):
        report_summary = CharField(max_length=16348, allow_blank=True)

    def post(self, request, audit_store_id, format=None):
        ds = self.ReportSummaryDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_summary = ds.validated_data['report_summary']
        audit_store = audit_store_service.set_report_summary(audit_store_id, report_summary, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdReimbursementView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class DeSerializer(Serializer):
        reimbursement = IntegerField()
    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.set_reimbursement_for_moderator(audit_store_id, ds.validated_data['reimbursement'], request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdQARatingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    class DeSerializer(Serializer):
        qa_rating = ChoiceField(AuditStore.QA_RATING)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        audit_store = get_object_or_404(AuditStore.objects.for_moderator(request.user), pk=audit_store_id)
        ds.is_valid(raise_exception=True)
        audit_store.rate(ds.validated_data['qa_rating'])
        return Response(AuditStoreSerializer(audit_store).data)


class AuditorRatingView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    class DeSerializer(Serializer):
        auditor_rating = ChoiceField(AuditorRating.RATING)

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        audit_store = get_object_or_404(AuditStore.objects.for_moderator(request.user), pk=audit_store_id)
        ds.is_valid(raise_exception=True)
        profile_info_service.save_auditor_rating(audit_store.user, ds.validated_data['auditor_rating'])
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_service.submit_for_moderator(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdUnSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    class DeSerializer(Serializer):
        reason = CharField(allow_blank=True)
        missing_proofs = ListField(required = False, child = IntegerField())

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.unsubmit_for_moderator(audit_store_id, request.user.id,
                                                                 ds.validated_data['reason'], ds.validated_data.get('missing_proofs'))
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    class DeSerializer(Serializer):
        message = CharField()

    def post(self, request, audit_store_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = audit_store_service.fail_for_moderator(audit_store_id, request.user.id, ds.validated_data['message'])
        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdQAOKView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id):
        audit_store = get_object_or_404(AuditStore.objects.for_moderator(request.user), pk=audit_store_id)
        set_attachment_by_proof_tag(audit_store_id)
        set_not_applicable_for_hide_questions(audit_store)
        audit_store.qa_ok(by=request.user)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdArrangeAttachment(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    def post(self, request, audit_store_id):
        audit_store = get_object_or_404(AuditStore.objects.for_moderator(request.user), pk=audit_store_id)
        set_attachment_by_proof_tag(audit_store_id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
        'POST': [GROUP_NAME_MODERATOR],
    }

    def get(self, request, audit_store_id, format=None):
        attachments = attachment_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id):
        try:
            post_data, attachment = attachment_service.upload_for_audit_store_for_moderator(
                audit_store_id,
                request.user.id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })


class ReportSectionAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
        'POST': [GROUP_NAME_MODERATOR],
    }

    def get(self, request, audit_store_id, section_id, format=None):
        attachments = attachment_service.find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id, section_id):
        try:
            post_data, attachment = attachment_service.upload_for_report_section_for_moderator(
                audit_store_id,
                section_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"],
                request.user.id)
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })

class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MODERATOR],
    }

    def delete(self, request, attachment_id):
        attachment_service.delete_for_moderator(attachment_id, request.user.id)
        return Response()


class AttachmentIdRenameView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_service.rename_for_moderator(attachment_id, request.user.id, request.data["file_name"])
            return Response(AttachmentSerializer(attachment).data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })


class AttachmentIdRotateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    def post(self, request, attachment_id):
        attachment = attachment_service.rotate_image_attachment_by_id(attachment_id, request.user.id,
                                                                      request.data["angle"])
        return Response(AttachmentSerializer(attachment).data)


class AttachmentIdCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }

    def post(self, request, attachment_id):
        attachment = attachment_service.complete_for_moderator(attachment_id, request.user.id)
        return Response(AttachmentSerializer(attachment).data)


class MoveAttachmentToSection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST':[GROUP_NAME_MODERATOR],
    }

    def post(self,request,audit_store_id):
        attachment = attachment_service.move_to_section(audit_store_id,request.data['section_id'],request.data['attachment_list'])
        return Response(AttachmentSerializer(attachment).data)


class AttachmentProofTagList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR]
    }
    def get(self, request, audit_cycle_id):
        proof_tag = audit_cycle_proof_tag_service.get_audit_cycle_proof_tag_for_attachment(audit_cycle_id)
        # return Response(AuditCycleProoftagListSerializer(proof_tag, many=True).data)
        return Response(proof_tag)


class AttachmentIdProofTagView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }
    def post(self, request, attachment_id):
        attachment = attachment_service.save_attachment_proof_tag(attachment_id, request.data['proof_tag_id'])
        return Response(AttachmentSerializer(attachment).data)


class AuditGuidelinesByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_grooups = {
        'GET': [GROUP_NAME_MODERATOR]
    }
    def get(self,request,audit_store_id,format=None):
        attachment = attachment_service.find_attachment_by_audit_store_id(audit_store_id)
        return Response(attachment)


class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_store_id, format=None):
        sections = section_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
        return Response(SectionSerializer(sections, many=True).data)

class ReportSectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_store_id, format=None):
        sections = report_section_moderator_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
        return Response(ReportSectionSerializer(sections, many=True).data)

class AnswerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, audit_store_id, format=None):
        sections = answer_moderator_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
        return Response(AnswerSerializer(sections, many=True).data)

class PMCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    class DeSerializer(Serializer):
        pm_comment = CharField()

    def post(self, request, audit_store_id, section_id, format=None):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_section = report_section_moderator_service.set_pm_comment_for_moderator(audit_store_id, section_id, ds.validated_data["pm_comment"], request.user.id)
        return Response(ReportSectionSerializer(report_section).data)


class AuditorCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    class DeSerializer(Serializer):
        auditor_comment = CharField()

    def post(self, request, audit_store_id, section_id, format=None):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_section = report_section_moderator_service.set_auditor_comment_for_moderator(audit_store_id, section_id, ds.validated_data["auditor_comment"], request.user.id)
        return Response(ReportSectionSerializer(report_section).data)


class NotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR]
    }

    class DeSerializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, section_id, format=None):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_section = report_section_moderator_service.set_not_applicable_for_moderator(audit_store_id, section_id, ds.validated_data["not_applicable"], request.user.id)
        return Response(ReportSectionSerializer(report_section).data)


class MarksObtainedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class MarkDeserializer(Serializer):
        marks_obtained = IntegerField(min_value=0)

    def post(self, request, audit_store_id, question_id):
        ds = self.MarkDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        marks_obtained = ds.validated_data.get('marks_obtained')
        answer = answer_moderator_service.set_marks_obtained_for_moderator(audit_store_id, question_id, marks_obtained, request.user.id)
        return Response(AnswerSerializer(answer).data)


class AnswerTextView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class Deserializer(Serializer):
        answer_text = CharField()
        status = BooleanField()

    def post(self, request, audit_store_id, question_id):
        ds = self.Deserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_text = ds.validated_data.get('answer_text')
        status = ds.validated_data.get('status')
        answer = answer_moderator_service.set_answer_text_for_moderator(audit_store_id, question_id, answer_text,
                                                                        request.user.id, status)
        return Response(AnswerSerializer(answer).data)

class AnswerNotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    class Deserializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, question_id):
        ds = self.Deserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        not_applicable = ds.validated_data.get('not_applicable')
        answer = answer_moderator_service.set_not_applicable_for_moderator(audit_store_id, question_id, not_applicable, request.user.id)
        return Response(AnswerSerializer(answer).data)


class AnswerCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id, question_id):
        try:
            answer = answer_moderator_service.set_answer_comment_for_moderator(audit_store_id, question_id, request.data["answer_comment"], request.user.id)
            return Response(AnswerSerializer(answer).data)
        except KeyError as e:
            raise ValidationError({
                e.args[0]: "{} is required".format(e.args[0])
            })


class AnswerRevertMessageView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id, question_id):
        try:
            answer = answer_moderator_service.set_answer_revert_message_for_moderator(audit_store_id, question_id, request.data["revert_message"], request.user.id)
            return Response(AnswerSerializer(answer).data)
        except KeyError as e:
            raise ValidationError({
                e.args[0]: "{} is required".format(e.args[0])
            })


class SectionRevertMessageView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id, section_id):
        try:
            report_section = report_section_moderator_service.set_section_revert_message_for_moderator(audit_store_id, section_id, request.data["revert_message"], request.user.id)
            return Response(ReportSectionSerializer(report_section).data)
        except KeyError as e:
            raise ValidationError({
                e.args[0]: "{} is required".format(e.args[0])
            })


class ClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR]
    }
    def get(self, request):
        client = client_service.find_client_by_active_cycle_status()
        return Response(ClientSerializer(client, many=True).data)

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MODERATOR],
    }
    def get(self, request, format=None):
        return Response({
            "USER_ID": request.user.id,
            "USER_EMAIL": request.user.email,
            "RHEA_PROTOCOL": settings.RHEA_PROTOCOL,
            "RHEA_DOMAIN": settings.RHEA_DOMAIN,
            "RHEA_BASE_URL": settings.RHEA_BASE_URL,
            "BRAND_NAME": settings.BRAND_NAME,
            "BRAND_SHORTNAME": settings.BRAND_SHORTNAME,
            **settings.FRONTEND_CONFIG["MODERATOR"],
            **settings.FRONTEND_CONFIG["COMMON"],
        })