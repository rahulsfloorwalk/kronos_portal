from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, DateField, CharField, IntegerField, BooleanField

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MODERATOR

import audit.service.audit_cycle as audit_cycle_service
import audit_store.service_moderator as audit_store_service
import attachment.service_moderator as attachment_service
import questionnaire.service.section as section_service
import answer.service.report_section_moderator as report_section_moderator_service
import answer.service.answer_moderator as answer_moderator_service

from .serializers import AuditCycleSerializer
from .serializers import AuditStoreSerializer
from .serializers import AttachmentSerializer
from .serializers import SectionSerializer
from .serializers import ReportSectionSerializer
from .serializers import AnswerSerializer


class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request):
        audit_cycles = audit_cycle_service.find_for_moderator(request.user.id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_cycle_id):
        audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, request.user.id)
        return Response(AuditCycleSerializer(audit_cycle).data)


class AuditStoreByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_cycle_id):
        try:
            audit_stores = audit_store_service.find_by_audit_cycle_for_moderator(audit_cycle_id, request.user.id)
            return Response(AuditStoreSerializer(audit_stores, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.find_by_id_for_moderator(audit_store_id, request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreIdAuditDateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST' : [GROUP_NAME_MODERATOR],
        }
    class DeSerializer(Serializer):
        audit_date = DateField()
    def post(self, request, audit_store_id):
        try:
            ds = self.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            audit_store = audit_store_service.set_audit_date_for_moderator(audit_store_id, ds.validated_data['audit_date'], request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e

class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST' : [GROUP_NAME_MODERATOR],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.submit_for_moderator(audit_store_id, request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreIdUnSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST' : [GROUP_NAME_MODERATOR],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.unsubmit_for_moderator(audit_store_id, request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST' : [GROUP_NAME_MODERATOR],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.fail_for_moderator(audit_store_id, request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound from e

class AuditStoreIdCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MODERATOR],
    }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.complete_for_moderator(audit_store_id, request.data["qa_rating"], request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except KeyError as e:
            raise ValidationError({
                'non_field_errors': ["Rating is required"]
            })


class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MODERATOR],
            'POST': [GROUP_NAME_MODERATOR],
        }

    def get(self, request, audit_store_id, format=None):
        try:
            attachments = attachment_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

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
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class ReportSectionAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MODERATOR],
            'POST': [GROUP_NAME_MODERATOR],
        }

    def get(self, request, audit_store_id, section_id, format=None):
        try:
            attachments = attachment_service.find_by_audit_store_and_section_for_moderator(audit_store_id, section_id, request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

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
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'DELETE': [GROUP_NAME_MODERATOR],
        }

    def delete(self, request, attachment_id):
        try:
            attachment_service.delete_for_moderator(attachment_id, request.user.id)
            return Response()
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AttachmentIdRenameView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MODERATOR],
        }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_service.rename_for_moderator(attachment_id, request.user.id, request.data["file_name"])
            return Response(AttachmentSerializer(attachment).data)
        except ObjectNotFound as e:
            raise NotFound() from e
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AttachmentIdCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MODERATOR],
        }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_service.complete_for_moderator(attachment_id, request.user.id)
            return Response(AttachmentSerializer(attachment).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            sections = section_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
            return Response(SectionSerializer(sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()

class ReportSectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            sections = report_section_moderator_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
            return Response(ReportSectionSerializer(sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()

class AnswerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MODERATOR],
        }
    def get(self, request, audit_store_id, format=None):
        try:
            sections = answer_moderator_service.find_by_audit_store_for_moderator(audit_store_id, request.user.id)
            return Response(AnswerSerializer(sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()


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
        try:
            report_section = report_section_moderator_service.submit_pm_comment_for_moderator(audit_store_id, section_id, ds.validated_data["pm_comment"], request.user.id)
            return Response(ReportSectionSerializer(report_section).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e


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
        try:
            report_section = report_section_moderator_service.submit_auditor_comment_for_moderator(audit_store_id, section_id, ds.validated_data["auditor_comment"], request.user.id)
            return Response(ReportSectionSerializer(report_section).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e


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
        try:
            report_section = report_section_moderator_service.set_not_applicable_for_moderator(audit_store_id, section_id, ds.validated_data["not_applicable"], request.user.id)
            return Response(ReportSectionSerializer(report_section).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e


class MarksObtainedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST' : [GROUP_NAME_MODERATOR],
    }
    class MarkDeserializer(Serializer):
        marks_obtained = IntegerField(min_value=0)

    def post(self, request, audit_store_id, question_id):
        ds = self.MarkDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        marks_obtained = ds.validated_data.get('marks_obtained')
        try:
            answer = answer_moderator_service.set_marks_obtained_for_moderator(audit_store_id, question_id, marks_obtained, request.user.id)
            return Response(AnswerSerializer(answer).data)
        except ObjectNotFound:
            raise NotFound
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class AnswerTextView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST' : [GROUP_NAME_MODERATOR],
    }
    class Deserializer(Serializer):
        answer_text = CharField()

    def post(self, request, audit_store_id, question_id):
        ds = self.Deserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_text = ds.validated_data.get('answer_text')
        try:
            answer = answer_moderator_service.set_answer_text_for_moderator(audit_store_id, question_id, answer_text, request.user.id)
            return Response(AnswerSerializer(answer).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class AnswerNotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST' : [GROUP_NAME_MODERATOR],
    }
    class Deserializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, question_id):
        ds = self.Deserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        not_applicable = ds.validated_data.get('not_applicable')
        try:
            answer = answer_moderator_service.set_not_applicable_for_moderator(audit_store_id, question_id, not_applicable, request.user.id)
            return Response(AnswerSerializer(answer).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


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
