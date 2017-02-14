from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import ObjectNotFound, AppLogicError
from .models import ProfileInfo, BankInfo, AdditionalInfo
from .forms import ProfileInfoForm, AdditionalInfoForm, BankInfoForm
from .serializers import ProfileInfoSerializer, AdditionalInfoSerializer, BankInfoSerializer, AuditSerializer
from .serializers import AnswerDeSerializer, ProfileInfoDeSerializer, AuditApplicationSerializer, AuditApplicationApplyDeSerializer, AuditApplicationCancelDeSerializer
from .serializers import AuditStoreSerializer
from .serializers import SectionSerializer
from .serializers import AnswerSerializer
from .serializers import AttachmentSerializer
from .serializers import ReportSectionSerializer, ReportSectionDeSerializer
from audit.models import Audit
from manager.models import City
from manager.serializers import CitySerializer
import manager.service.audit as audit_service
from manager import states
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR
from audit_store import service as audit_store_service
from questionnaire.service import section as section_service
from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
import attachment.service as attachment_service

class ProfileInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            profile_info = ProfileInfo.objects.get(user_id=request.user.id)
            return Response(ProfileInfoSerializer(profile_info).data)
        except ProfileInfo.DoesNotExist:
            raise Http404

    def post(self, request):
        profile_info_ds = ProfileInfoDeSerializer(data=request.data, context={'current_user': request.user})
        profile_info_ds.is_valid(raise_exception=True)
        profile_info = profile_info_ds.deserialize()
        profile_info.save()
        return Response(ProfileInfoSerializer(profile_info).data)

class AdditionalInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
            return Response(AdditionalInfoSerializer(additional_info).data)
        except AdditionalInfo.DoesNotExist:
            return Response(AdditionalInfoSerializer(AdditionalInfo()).data)

    def post(self, request):
        additional_info_s= AdditionalInfoSerializer(data=request.data)
        additional_info_s.is_valid(raise_exception=True)
        additional_info = additional_info_s.save(current_user=request.user)
        return Response(AdditionalInfoSerializer(additional_info).data)


class BankInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            bank_info = BankInfo.objects.get(user_id=request.user.id)
            return Response(BankInfoSerializer(bank_info).data)
        except BankInfo.DoesNotExist:
            return Response(BankInfoSerializer(BankInfo()).data)

    def post(self, request):
        bank_info_s = BankInfoSerializer(data=request.data)
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.save(current_user=request.user)
        return Response(BankInfoSerializer(bank_info).data)

class AvailableAuditsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            available_audits = audit_service.get_available_audits(request.user.profileinfo.id)
            return Response(AuditSerializer(available_audits, many=True).data)
        except (AppLogicError,ProfileInfo.DoesNotExist) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_id, format=None):
        audit = Audit.objects.get(id=audit_id)
        return Response(AuditSerializer(audit).data)

class AuditApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            applications = audit_service.get_applications( request.user.profileinfo.id)
            return Response(AuditApplicationSerializer(applications, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()
        except ProfileInfo.DoesNotExist as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditStoresView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            audit_stores = audit_store_service.get_audit_stores( request.user.profileinfo.id)
            return Response(AuditStoreSerializer(audit_stores, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()
        except ProfileInfo.DoesNotExist as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            audit_store = audit_store_service.get_audit_store( audit_store_id, request.user.profileinfo.id)
            return Response(AuditStoreSerializer(audit_store).data)
        except ObjectNotFound as e:
            raise NotFound()
        except ProfileInfo.DoesNotExist as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            sections = section_service.get_for_auditor(audit_store_id, request.user.profileinfo.id)
            return Response(SectionSerializer(sections, many=True).data)
        except ObjectNotFound as e:
            raise NotFound()
        except ProfileInfo.DoesNotExist as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditApplicationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_id, location_id, format=None):
        try:
            application = audit_service.get_application(audit_id, location_id, request.user.profileinfo.id)
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound as e:
            raise NotFound()
        except ProfileInfo.DoesNotExist as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AuditApplicationApplyView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR]
        }
    def post(self, request, audit_id, format=None):
        try:
            request.data["audit_id"] = audit_id
            request.data["profileinfo_id"] = request.user.profileinfo.id

            application_apply_ds = AuditApplicationApplyDeSerializer(data=request.data)
            application_apply_ds.is_valid(raise_exception=True)

            application = audit_service.apply(
                    application_apply_ds.data["audit_id"],
                    application_apply_ds.data["profileinfo_id"],
                    application_apply_ds.data["audit_date"]
            )
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except (AppLogicError, ProfileInfo.DoesNotExist) as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e

class AuditApplicationCancelView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR]
        }
    def post(self, request, audit_id, format=None):
        try:
            data = {}
            data["audit_id"] = audit_id
            data["profileinfo_id"] = request.user.profileinfo.id

            application_cancel_ds = AuditApplicationCancelDeSerializer(data=data)
            application_cancel_ds.is_valid(raise_exception=True)

            application = audit_service.cancel(
                    application_cancel_ds.data["audit_id"],
                    application_cancel_ds.data["profileinfo_id"]
            )
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except (AppLogicError, ProfileInfo.DoesNotExist) as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class StateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        return Response(states.states)

class AnswerSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR]
        }
    def post(self, request, question_id, format=None):
        request.data['question'] = question_id
        ds = AnswerDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = ds.validated_data['audit_store']
        answer_text = ds.validated_data['answer_text']
        question = ds.validated_data['question']
        try:
            answer = answer_service.submit_answer(audit_store.id, question.id, request.user.id, answer_text)
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e
        return Response(AnswerSerializer(answer).data)

class AnswerListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            answers = answer_service.get_answers(audit_store_id, request.user.id)
        except ObjectNotFound:
            raise NotFound()
        return Response(AnswerSerializer(answers, many=True).data)


class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR],
        }
    def post(self, request, audit_store_id):
        try:
            audit_store = audit_store_service.submit(audit_store_id, request.user.profileinfo.user_id)
            return Response(AuditStoreSerializer(audit_store).data)
        except (AppLogicError,ProfileInfo.DoesNotExist) as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class ReportSectionListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_store_id, format=None):
        try:
            report_sections = report_section_service.find_by_audit_store_for_user(audit_store_id, request.user.id)
            return Response(ReportSectionSerializer(report_sections, many=True).data)
        except ObjectNotFound:
            raise NotFound

class CommentSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR]
        }
    def post(self, request, section_id, format=None):
        request.data['section'] = section_id
        ds = ReportSectionDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_store = ds.validated_data['audit_store']
        auditor_comment = ds.validated_data['auditor_comment']
        section = ds.validated_data['section']
        try:
            report_section = report_section_service.submit_auditor_comment(audit_store.id, section.id, request.user.id, auditor_comment)
            return Response(ReportSectionSerializer(report_section).data)
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e


class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }

    def get(self, request, audit_store_id, format=None):
        try:
            attachments = attachment_service.find_by_audit_store_for_auditor(audit_store_id, request.user.profileinfo.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

    def post(self, request, audit_store_id):
        try:
            post_data, attachment = attachment_service.upload_for_audit_store(
                    audit_store_id, 
                    request.user.profileinfo.id, 
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


class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'DELETE': [GROUP_NAME_AUDITOR],
        }

    def delete(self, request, attachment_id):
        try:
            attachment_service.delete_for_user(attachment_id, request.user.id)
            return Response()
        except ObjectNotFound as e:
            raise NotFound() from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class AttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR],
        }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_service.complete_for_user(attachment_id, request.user.id)
            return Response(AttachmentSerializer(attachment).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })
