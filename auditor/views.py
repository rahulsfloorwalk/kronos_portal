import requests
from django.http import Http404, HttpResponse
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

import attachment.service_auditor as attachment_auditor_service
from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
from audit.service import audit_service
from audit_store import service as audit_store_service
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from auditor.serializers import AnswerDeSerializer, ProfileInfoDeSerializer, AuditApplicationSerializer, AuditApplicationApplyDeSerializer, AuditApplicationCancelDeSerializer, PlainUserSerializer
from auditor.serializers import AnswerSerializer
from auditor.serializers import AttachmentSerializer
from auditor.serializers import AuditStoreSerializer
from auditor.serializers import NotificationSerializer
from auditor.serializers import PaymentSerializer
from auditor.serializers import ProfileInfoSerializer, AdditionalInfoDeSerializer, AdditionalInfoSerializer, BankInfoSerializer, AuditSerializer
from auditor.serializers import ReportSectionSerializer, ReportSectionDeSerializer
from auditor.serializers import SectionSerializer
from auditor.serializers import FacebookSerializer, FacebookDeSerializer
from auditor.service import application_service
from auditor.service import stats as auditor_dashboard_service
from kronos.exceptions import ObjectNotFound, AppLogicError
from manager import states
from manager.models import City
from manager.service import notifications as notification_service
from payment.service import payment_auditor as payment_service
from questionnaire.service import section as section_service
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR
from social.service import social_auditor as social_service
from .serializers import CitySerializer
from auditor.service import profile_info_service


class ProfileInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        profile_info = profile_info_service.find_profile_info_by_user_id(request.user.id)
        return Response(ProfileInfoSerializer(profile_info).data)

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
        additional_info_ds= AdditionalInfoDeSerializer(data=request.data, context={'current_user' : request.user})
        additional_info_ds.is_valid(raise_exception=True)
        additional_info = additional_info_ds.deserialize()
        additional_info.save()
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
        bank_info_s = BankInfoSerializer(data=request.data, context={'current_user' : request.user})
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.deserialize()
        bank_info.save()
        return Response(BankInfoSerializer(bank_info).data)

class FacebookInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        fb_info = social_service.find_facebook_by_user(request.user.id)
        return Response(FacebookSerializer(fb_info).data)

    def post(self, request):
        facebook_ds = FacebookDeSerializer(data=request.data, context={'current_user' : request.user})
        facebook_ds.is_valid(raise_exception=True)
        facebook = facebook_ds.deserialize()
        facebook = social_service.save(facebook)
        return Response(FacebookSerializer(facebook).data)

class AvailableAuditsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        city_id = request.GET.get('city_id')
        kms = request.GET.get('kms')
        try:
            available_audits = audit_service.get_available_audits_within_box(request.user.profileinfo.id, city_id, kms)
            return Response(AuditSerializer(available_audits, many=True).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_id, format=None):
        audit = audit_service.find_audit_by_id(audit_id)
        return Response(AuditSerializer(audit).data)

class AuditApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }
    def get(self, request, format=None):
        try:
            applications = application_service.get_applications( request.user.profileinfo.id)
            return Response(AuditApplicationSerializer(applications, many=True).data)
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
            audit_stores = audit_store_service.find_audit_stores_for_auditor( request.user.profileinfo.id)
            return Response(AuditStoreSerializer(audit_stores, many=True).data)
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
            audit_store = audit_store_service.find_by_id_for_auditor( audit_store_id, request.user.id)
            return Response(AuditStoreSerializer(audit_store).data)
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
    def get(self, request, audit_id, format=None):
        application = application_service.get_application(audit_id, request.user.profileinfo.id)
        return Response(AuditApplicationSerializer(application).data)

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

            application = application_service.apply(
                    application_apply_ds.validated_data["audit_id"].id,
                    application_apply_ds.validated_data["profileinfo_id"].id,
                    application_apply_ds.validated_data["audit_date"]
            )
            return Response(AuditApplicationSerializer(application).data)
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

            application = application_service.cancel(
                    application_cancel_ds.data["audit_id"],
                    application_cancel_ds.data["profileinfo_id"]
            )
            return Response(AuditApplicationSerializer(application).data)
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
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            }) from e
        return Response(AnswerSerializer(answer).data)


class AnswerCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_AUDITOR]
        }
    def post(self, request, question_id, format=None):
        try:
            audit_store_id = request.data['audit_store_id']
            answer_comment = request.data['answer_comment']
            answer = answer_service.set_answer_comment_by_auditor(audit_store_id, question_id, answer_comment, request.user.id)
            return Response(AnswerSerializer(answer).data)
        except KeyError as e:
            raise ValidationError({
                e.args[0]: "{} is required".format(e.args[0])
            })


class AnswerListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_AUDITOR]
        }
    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store_for_auditor(audit_store_id, request.user.id)
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
        report_sections = report_section_service.find_by_audit_store_for_user(audit_store_id, request.user.id)
        return Response(ReportSectionSerializer(report_sections, many=True).data)

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
            attachments = attachment_auditor_service.find_by_audit_store_for_auditor(audit_store_id, request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id):
        try:
            post_data, attachment = attachment_auditor_service.upload_for_audit_store_by_auditor(
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
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class ReportSectionAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }

    def get(self, request, audit_store_id, section_id, format=None):
        attachments = attachment_auditor_service.find_by_audit_store_and_section_for_auditor(audit_store_id, section_id, request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id, section_id):
        try:
            post_data, attachment = attachment_auditor_service.upload_for_report_section_by_auditor(
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
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class UserIdProofAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_AUDITOR],
            'POST': [GROUP_NAME_AUDITOR]
        }

    def get(self, request, format=None):
        try:
            attachments = attachment_auditor_service.find_id_proof_for_auditor(request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

    def post(self, request):
        try:
            post_data, attachment = attachment_auditor_service.upload_for_id_proof_by_auditor(
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
        except ObjectNotFound:
            raise NotFound


class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'DELETE': [GROUP_NAME_AUDITOR],
        }

    def delete(self, request, attachment_id):
        try:
            attachment_auditor_service.delete_for_auditor(attachment_id, request.user.id)
            return Response()
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
            attachment = attachment_auditor_service.complete_for_auditor(attachment_id, request.user.id)
            return Response(AttachmentSerializer(attachment).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class NotificationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        notifications = notification_service.find_by_recipient_user_and_verb(request.user.id)
        return Response(NotificationSerializer(notifications, many=True).data)

class UserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        return Response(PlainUserSerializer(request.user).data)


class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        payments = payment_service.find_by_user(request.user.id)
        return Response(PaymentSerializer(payments, many=True).data)

class StatsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        auditor_history = auditor_dashboard_service.getAuditorStats(request.user.id)
        return Response(auditor_history)

class ScoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        auditor_score = auditor_dashboard_service.getAuditorScore(request.user.id)
        return Response(auditor_score)
