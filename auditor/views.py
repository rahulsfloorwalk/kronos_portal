from django.conf import settings
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.serializers import Serializer, BooleanField, CharField, ChoiceField
from attachment.service import set_attachment_by_proof_tag
from django.db.transaction import atomic
import attachment.service_auditor as attachment_auditor_service
from answer.service import answer as answer_service
from answer.service import report_section as report_section_service
from audit.service import audit_service
from audit_store import service as audit_store_service
from audit_store import service_auditor as audit_store_auditor_service
from auditor.serializers import AnswerDeSerializer, ProfileInfoDeSerializer, AuditApplicationSerializer, AuditApplicationApplyDeSerializer, AuditApplicationCancelDeSerializer, PlainUserSerializer
from auditor.serializers import AnswerSerializer
from auditor.serializers import GenderSerializer,MaritalStatusSerializer,EducationSerializer,IncomeSerializer,AuditorRatingSerializer,PronounsSerializer,IndustrySerializer
from auditor.serializers import AttachmentSerializer
from auditor.serializers import AuditStoreSerializer
from auditor.serializers import NotificationSerializer
from auditor.serializers import PaymentSerializer
from auditor.serializers import ProfileInfoSerializer, AdditionalInfoDeSerializer, AdditionalInfoSerializer, BankInfoSerializer, AuditSerializer,AppliedAuditSerializer, PreferencesSerializer,ReportFeedbackByAuditorSerializer,ReportFeedbackByAuditorDeserializer
from auditor.serializers import ResolutionSerializer,OccupationSerializer,DistanceSerializer,CarCostSerializer
from auditor.serializers import ReportSectionSerializer, ReportSectionDeSerializer
from auditor.serializers import ReferralSerializer
from auditor.serializers import SectionSerializer
from auditor.serializers import FacebookSerializer, FacebookDeSerializer
from auditor.service import application_service
from auditor.service import preferences_service
from auditor.service import stats as auditor_dashboard_service
from manager import states
from manager import country
from manager.service.instance_approved_application import audit_cycle_audit_auto_approve_check_by_applictaion_id
from manager.models import City
from manager.service import notifications as notification_service
from payment.service import payment_auditor as payment_service
from questionnaire.service import section as section_service
from referral.service import referral_auditor as referral_service
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR
from social.service import social_auditor as social_service
from .serializers import CitySerializer
from auditor.service import profile_info_service
from auditor.service import additional_info_service
from auditor.service import bank_info_service
from audit.service import audit_cycle_proof_tag
from manager.service import instance_approved_application
# from .serializers import AuditCycleProoftagListSerializer
from audit_store.models import AuditStore,ReportFeedbackByAuditor
from answer.models import ReportSection
from datetime import datetime, timedelta
import registration.service.auditor as auditor_service
from manager.viewss.auditor import AuditorSerializer
from manager.models import ProofTag
from client.models import ClientModerator
from django.db import IntegrityError
from rest_framework.permissions import AllowAny
from auditor.serializers import AuditProoftagSerializer
from django.shortcuts import get_object_or_404
from auditor.models import AuditApplication
from audit.models.proof_tag import AuditCycleProofTagList
from manager.models import AuditProoftagNotAvailable
from attachment import service as attachment_service
import answer.service.answer_moderator as answer_moderator_service
from rest_framework.serializers import Serializer, IntegerField, CharField
from manager.service import moderator as moderator_service
from django.contrib.auth.models import Group
from django.db.models import Count
from registration.models import GROUP_NAME_MODERATOR
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from kronos.exceptions import AppLogicError,ObjectNotFound
from guardian.models import UserObjectPermission
from django.utils import timezone

import logging
_logger = logging.getLogger(__name__)

# Get the current date
current_date = datetime.now().date()
# Calculate tomorrow's date
tomorrow_date = current_date + timedelta(days=1)
class ProfileInfoView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
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
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        additional_info = additional_info_service.find_additional_info_by_user_id(request.user.id)
        return Response(AdditionalInfoSerializer(additional_info).data)

    def post(self, request):
        additional_info_ds= AdditionalInfoDeSerializer(data=request.data, context={'current_user': request.user})
        additional_info_ds.is_valid(raise_exception=True)
        additional_info = additional_info_ds.deserialize()
        additional_info.save()
        return Response(AdditionalInfoSerializer(additional_info).data)

class AuditReportFeedback(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self,request, audit_store_id,format=None):
        additional_info = additional_info_service.find_report_feedback_by_user_id(request.user.id)
        # report_feedback = ReportFeedbackByAuditor.objects.get(user=request.user.id, audit_store__id=audit_store_id)
        report_feedback = get_object_or_404(ReportFeedbackByAuditor, user=request.user.id, audit_store__id=audit_store_id)
        return Response(ReportFeedbackByAuditorSerializer(report_feedback).data)

    def post(self, request,audit_store_id):
        report_feedback_ds= ReportFeedbackByAuditorDeserializer(data=request.data, context={'current_user': request.user,'audit_store_id': audit_store_id})
        report_feedback_ds.is_valid(raise_exception=True)
        report_feedback = report_feedback_ds.deserialize()
        report_feedback.save()
        return Response(ReportFeedbackByAuditorSerializer(report_feedback).data)

class BankInfoView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        bank_info = bank_info_service.find_bank_info_by_user_id(request.user.id)
        return Response(BankInfoSerializer(bank_info).data)

    def post(self, request):
        bank_info_s = BankInfoSerializer(data=request.data, context={'current_user': request.user})
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.deserialize(request.user.id)
        bank_info = bank_info_service.save(bank_info)
        return Response(BankInfoSerializer(bank_info).data)

class MobileNumberView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    def post(self, request):
        profile_info = profile_info_service.set_mobile_number_for_auditor(request.user.id, request.data.get('mobile_number'),request.data.get('dial_code'))
        return Response(ProfileInfoSerializer(profile_info).data)

class WhatsappNumberView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    def post(self, request):
        profile_info = profile_info_service.set_whatsapp_number_for_auditor(request.user.id, request.data.get('whatsapp_number'),request.data.get('whatsapp_dial_code'))
        return Response(ProfileInfoSerializer(profile_info).data)

class CertificationMarksView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
        'GET' : [GROUP_NAME_AUDITOR]
    }
    def get(self,request):
        profile_info = profile_info_service.find_profile_info_by_user_id(request.user.id)
        return Response(ProfileInfoSerializer(profile_info).data)
    def post(self, request):
        profile_info = profile_info_service.find_profile_info_by_user_id(request.user.id)
        profile_info.certification_score = request.data.get('marks')
        profile_info.save()
        return Response(ProfileInfoSerializer(profile_info).data)
    
class FacebookInfoView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        fb_info = social_service.find_facebook_by_user(request.user.id)
        return Response(FacebookSerializer(fb_info).data)

    def post(self, request):
        facebook_ds = FacebookDeSerializer(data=request.data, context={'current_user': request.user})
        facebook_ds.is_valid(raise_exception=True)
        facebook = facebook_ds.deserialize()
        facebook = social_service.save(facebook)
        return Response(FacebookSerializer(facebook).data)

class AvailableAuditsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        kms = request.GET.get('kms')
        # available_audits = audit_service.find_audits_for_auditor(request.user.id, kms)
        available_audits = audit_service.find_audits_for_auditor_limit(request.user.id, kms)
        return Response(AuditSerializer(available_audits, many=True).data)

class ProfileMatchPercentageView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_cycle_id, format=None):
        total_factors_count, valid_factors_count, match_percentage = audit_service.calculate_profile_match(request.user.id, audit_cycle_id)
        response_data = {
            "total_factors_count": total_factors_count,
            "valid_factors_count": valid_factors_count,
            "match_percentage": match_percentage,
        }
        return Response(response_data)

class AppliedAuditsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        applied_audits,total_count = audit_service.find_applied_audits_by_auditor_id(request.user.id, request.GET.get('is_load_more'), request.GET.get('last_total_count'))
        # return Response(AppliedAuditSerializer(applied_audits,many=True).data)
        return Response({'applied_audits': AppliedAuditSerializer(applied_audits, many=True).data, 'total_count': total_count})
        
        
class AvailableAuditsByCityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        kms = request.GET.get('kms')
        city_id = request.GET.get('city_id')
        available_audits = audit_service.find_audits_by_city(request.user.id, city_id, kms)
        return Response(AuditSerializer(available_audits, many=True).data)

class AuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_id, format=None):
        audit = audit_service.find_audit_by_id(audit_id)
        return Response(AuditSerializer(audit).data)

class AuditApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        applications = application_service.get_applications(request.user.profileinfo.id)
        return Response(AuditApplicationSerializer(applications, many=True).data)
        # return Response({'applications': AuditStoreSerializer(applications, many=True).data, 'total_count': total_count})


class AuditStoresView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        audit_stores = audit_store_service.find_audit_stores_for_auditor(request.user.profileinfo.id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)
        # return Response({'audit_stores': AuditStoreSerializer(audit_stores, many=True).data, 'total_count': total_count})
        
class AuditStoreIdReportSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    class ReportSummaryDeSerializer(Serializer):
        report_summary = CharField(max_length=16348, allow_blank=True)

    def post(self, request, audit_store_id):
        ds = self.ReportSummaryDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        report_summary = ds.validated_data['report_summary']
        audit_store = audit_store_auditor_service.set_report_summary(audit_store_id, request.user.id, report_summary)
        return Response(AuditStoreSerializer(audit_store).data)
        
class AuditStoreIdNpsSectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    # class NpsSectionDeSerializer(Serializer):
    #     nps_section = CharField(max_length=16348, allow_blank=True)

    class NpsSectionDeSerializer(Serializer):
        nps_section = ChoiceField(choices=AuditStore.NPS_RATING, required=False, allow_null=True, allow_blank=True )


    def post(self, request, audit_store_id):
        ds = self.NpsSectionDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        nps_section = ds.validated_data['nps_section']
        audit_store = audit_store_auditor_service.set_nps_section(audit_store_id, request.user.id, nps_section)
        return Response(AuditStoreSerializer(audit_store).data)

        
# class ReportSubmissionTimeView(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'POST': [GROUP_NAME_AUDITOR]
#     }
#     class ReportSubmissionTimeDeSerializer(Serializer):
#         report_submission_time = CharField(allow_null=True, allow_blank=True )

#     def post(self, request, audit_store_id):
#         ds = self.ReportSubmissionTimeDeSerializer(data=request.data)
#         ds.is_valid(raise_exception=True)
#         report_submission_time = ds.validated_data['report_submission_time']
#         audit_store = audit_store_auditor_service.set_report_submission_time(audit_store_id, request.user.id, report_submission_time)
#         return Response(AuditStoreSerializer(audit_store).data)

class ReportSubmissionTimeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }
    class ReportSubmissionTimeItemSerializer(Serializer):
        audit_store_id = IntegerField()
        report_submission_time = CharField(allow_null=True, allow_blank=True)

    def post(self, request):
        input_serializer = self.ReportSubmissionTimeItemSerializer(data=request.data, many=True)
        input_serializer.is_valid(raise_exception=True)
        updated_audit_stores = []
        skipped_items = []
        for item in input_serializer.validated_data:
            try:
                audit_store = audit_store_auditor_service.set_report_submission_time(
                    item["audit_store_id"],
                    request.user.id,
                    item["report_submission_time"]
                )
                updated_audit_stores.append(audit_store)
            except (ObjectNotFound, AppLogicError) as e:
                skipped_items.append({
                    "audit_store_id": item["audit_store_id"],
                    "error": str(e)
                })
        output_serializer = AuditStoreSerializer(updated_audit_stores, many=True)
        return Response(output_serializer.data, status=200)

class AuditStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_store_id, format=None):
        audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)

class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_store_id, format=None):
        sections = section_service.get_for_auditor(audit_store_id, request.user.profileinfo.id)
        return Response(SectionSerializer(sections, many=True).data)

class AuditApplicationView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
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
    @atomic
    def post(self, request, audit_id, format=None):
        current_date = datetime.now().date()
        six_months_ago = timezone.now() - timedelta(days=180)
        tomorrow_date = current_date + timedelta(days=1)

        request.data["audit_id"] = audit_id
        request.data["profileinfo_id"] = request.user.profileinfo.id

        application_apply_ds = AuditApplicationApplyDeSerializer(data=request.data)
        application_apply_ds.is_valid(raise_exception=True)

        # mising aidit aligment factor in auditor profile
        audit = audit_service.find_audit_by_id(audit_id)
        missing = []
        factors = audit.audit_cycle.audit_alignment_factors or []
        profileinfo = getattr(request.user, "profileinfo", None)
        additionalinfo = getattr(request.user, "additionalinfo", None)


        user_joined_before_6_months = request.user.date_joined < six_months_ago
        # Check if user joined and updated profile before 6 months
        if user_joined_before_6_months:
            if additionalinfo:
                last_updated = additionalinfo.modified_at or additionalinfo.created_at
            else:
                last_updated = None

            if not last_updated or last_updated < six_months_ago:
                return Response(
                    {"profileinfoerror": "Please update your profile before applying for audits."},
                    status=400
                )
        
        #  Check missing audit alignment factors
        skip_keys = {"auditor_rating", "report_rating", "date_availability", "auditor_age_range"}
        factors_with_value = [f for f in factors if f['value']]  

        for factor in factors_with_value:
            key = factor.get("key")
            label = factor.get("label", key)
            if not key or key in skip_keys:
                continue

            # get value from profileinfo or additionalinfo
            value = getattr(profileinfo, key, None) or getattr(additionalinfo, key, None)

            # check if this factor is missing
            is_missing = value in [None, "", [], {}]

            if is_missing:
                missing.append(label)

        if missing:
            return Response({"profileinfoerror": "Please fill these fields first: " + ", ".join(missing)},status=400)

        application = application_service.apply(
            application_apply_ds.validated_data["audit_id"].id,
            request.user.id,
            application_apply_ds.validated_data["audit_date"]
        )
        audit_auto_approve = audit_cycle_audit_auto_approve_check_by_applictaion_id(application.id) 
        if str(request.data['audit_date']) in [str(current_date), str(tomorrow_date)] and audit_auto_approve:
        # if str(request.data['audit_date']) == str(tomorrow_date) and audit_auto_approve:
            instance_approved_application.approved(application.id)
            audit_application = AuditApplication.objects.get(id=application.id)
            # audit_application.report_exists = True
            audit_application.save()
        return Response(AuditApplicationSerializer(application).data)

class AuditApplicationCancelView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }
    def post(self, request, audit_id, format=None):
        data = {}
        data["audit_id"] = audit_id
        data["profileinfo_id"] = request.user.profileinfo.id

        application_cancel_ds = AuditApplicationCancelDeSerializer(data=data)
        application_cancel_ds.is_valid(raise_exception=True)

        application = application_service.cancel(
            application_cancel_ds.data["audit_id"],
            request.user.id,
        )
        return Response(AuditApplicationSerializer(application).data)


class CityView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class CityGetByIdView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request, city_id, format=None):
        try:
            city = City.objects.get(id=city_id)
        except City.DoesNotExist:
            raise NotFound({"detail": "City not found."})
        serializer = CitySerializer(city)
        return Response(serializer.data)
    
class StateView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        return Response(states.states)


class StateViewByCountry(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }

    def get(self, request, country):
        return Response(states.get_state_by_country(country))


class CountryView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }

    def get(self, request, format=None):
        return Response(country.country)


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
        status = request.data['status']
        answer = answer_service.submit_answer(audit_store.id, question.id, request.user.id, answer_text, status)
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
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store_for_auditor(audit_store_id, request.user.id)
        return Response(AnswerSerializer(answers, many=True).data)


class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }
    class DeSerializer(Serializer):
        user_id = IntegerField()
    
    def post(self, request, audit_store_id):
        audit_store = audit_store_auditor_service.submit_report(audit_store_id, request.user.id)
        if 'report_submission_time' in request.data:
            audit_store.report_submission_time = request.data['report_submission_time']
            audit_store.save()

        excluded_client_ids = [344, 345, 346]
        client_id = audit_store.audit.audit_cycle.client_id

        if client_id in excluded_client_ids:
            _logger.info("Auto-assign skipped for audit_store ID: " + str(audit_store_id) + " (client_id " + str(client_id) + " is in excluded list)")
            return Response(AuditStoreSerializer(audit_store).data)

        # eligible_moderator_ids = [503761,454714,45590,7450] 
        # eligible_moderator_ids = [6,32,33] 
        try:
            moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
            client_moderators = ClientModerator.objects.filter(client_id=client_id,user__is_active=True).values_list("user_id", flat=True)

            eligible_moderator_ids = list(client_moderators)
            if not eligible_moderator_ids:
                _logger.info("No client moderators configured for client_id " + {client_id} + " . Auto-assign skipped.")
                return Response(AuditStoreSerializer(audit_store).data)

            content_type = ContentType.objects.get_for_model(AuditStore)
            permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

            assigned_perms_for_this_store = UserObjectPermission.objects.filter( content_type=content_type, object_pk=str(audit_store_id), permission=permission, user__is_active=True )
            if assigned_perms_for_this_store.exists():
                assigned_users = [perm.user for perm in assigned_perms_for_this_store]
                return Response(AuditStoreSerializer(audit_store).data)

            reports = AuditStore.objects.filter(status=AuditStore.SUBMITTED).values("id")
            report_ids = [str(report["id"]) for report in reports]

            perms = UserObjectPermission.objects.filter( content_type=content_type, object_pk__in=report_ids, permission=permission, user__is_active=True,user__id__in=eligible_moderator_ids )

            moderator_counts = {}
            for perm in perms:
                if perm.user_id not in moderator_counts:
                    moderator_counts[perm.user_id] = 0
                moderator_counts[perm.user_id] += 1
            moderators = moderator_group.user_set.filter(is_active=True, id__in=eligible_moderator_ids)
            selected_moderator = min(
                moderators,
                key=lambda m: moderator_counts.get(m.id, 0)
            )

            audit_store = moderator_service.assign_audit_store(selected_moderator.id, audit_store_id)

        except Exception as e:
            _logger.info("Moderator not assigned due to error: " + str(e))

        return Response(AuditStoreSerializer(audit_store).data)

class AuditStoreIdSubmitReportView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_auditor_service.submit_report(audit_store_id, request.user.id)
        # audit_store = audit_store_auditor_service.submit_report_api(audit_store_id, request.user.id)
        if 'report_submission_time' in request.data:
            audit_store.report_submission_time = request.data['report_submission_time']
            audit_store.save()
        if 'submission_source' in request.data:
            audit_store.submission_source = request.data['submission_source']
            audit_store.save()

        excluded_client_ids = [344, 345, 346]
        client_id = audit_store.audit.audit_cycle.client_id

        if client_id in excluded_client_ids:
            _logger.info("Auto-assign skipped for audit_store ID: " + str(audit_store_id) + " (client_id " + str(client_id) + " is in excluded list)")
            return Response(AuditStoreSerializer(audit_store).data)
        
        # eligible_moderator_ids = [503761,454714,45590,7450] 
        try:
            moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
            client_moderators = ClientModerator.objects.filter(client_id=client_id,user__is_active=True,is_active=True).values_list("user_id", flat=True)

            eligible_moderator_ids = list(client_moderators)
            if not eligible_moderator_ids:
                _logger.info("No client moderators configured for client_id " + {client_id} + " . Auto-assign skipped.")
                return Response(AuditStoreSerializer(audit_store).data)

            content_type = ContentType.objects.get_for_model(AuditStore)
            permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

            assigned_perms_for_this_store = UserObjectPermission.objects.filter( content_type=content_type, object_pk=str(audit_store_id), permission=permission, user__is_active=True)
            if assigned_perms_for_this_store.exists():
                assigned_users = [perm.user for perm in assigned_perms_for_this_store]
                return Response(AuditStoreSerializer(audit_store).data)

            reports = AuditStore.objects.filter(status=AuditStore.SUBMITTED).values("id")
            report_ids = [str(report["id"]) for report in reports]

            perms = UserObjectPermission.objects.filter( content_type=content_type, object_pk__in=report_ids, permission=permission, user__is_active=True,user__id__in=eligible_moderator_ids )

            moderator_counts = {}
            for perm in perms:
                if perm.user_id not in moderator_counts:
                    moderator_counts[perm.user_id] = 0
                moderator_counts[perm.user_id] += 1
            moderators = moderator_group.user_set.filter(is_active=True, id__in=eligible_moderator_ids)
            selected_moderator = min(
                moderators,
                key=lambda m: moderator_counts.get(m.id, 0)
            )

            audit_store = moderator_service.assign_audit_store(selected_moderator.id, audit_store_id)

        except Exception as e:
            _logger.info("Moderator not assigned due to error: " + str(e))

        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdAcknowledgeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_auditor_service.acknowledge_report(audit_store_id, request.user.id)
        audit_=AuditStore.objects.get(pk=audit_store_id)
        hide_sections=audit_.audit.audit_cycle.sections.filter(hide_comment=True).all()
        if len(hide_sections)>1:
            for i in hide_sections:
                try:
                    report=ReportSection.objects.get(audit_store_id=audit_store_id, section_id=i.id)
                except ReportSection.DoesNotExist:
                    report=ReportSection()
                    report.section = i
                    report.audit_store= audit_
                    report.pm_comment = "--"
                    report.save()
        elif len(hide_sections)==1:
            section_hide=audit_.audit.audit_cycle.sections.get(hide_comment=True)
            if section_hide:
                try:
                    report=ReportSection.objects.get(audit_store_id=audit_store_id, section_id=section_hide.id)
                except ReportSection.DoesNotExist:
                    report=ReportSection()
                    report.section = section_hide
                    report.audit_store= audit_
                    report.pm_comment = "--"
                    report.save()
        else:
            pass
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }

    class FailedMessageDeSerializer(Serializer):
        message = CharField(max_length=4096, allow_blank=True)

    def post(self, request, audit_store_id):
        ds = self.FailedMessageDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        message = ds.validated_data['message']
        audit_store = audit_store_auditor_service.fail_report(audit_store_id, request.user.id, message)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdWithdrawView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }

    class WithdrawMessageDeSerializer(Serializer):
        message = CharField(max_length=4096, allow_blank=True)

    def post(self, request, audit_store_id):
        ds = self.WithdrawMessageDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        message = ds.validated_data['message']
        audit_store = audit_store_auditor_service.withdraw_report(audit_store_id, request.user.id, message)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreReportConcern(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }

    class ReportConcernDeSerializer(Serializer):
        message = CharField(max_length=4096, allow_blank=False)

    def post(self, request, audit_store_id):
        ds = self.ReportConcernDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        message = ds.validated_data['message']
        audit_store = audit_store_auditor_service.concern_report(audit_store_id, request.user.id, message)
        return Response(AuditStoreSerializer(audit_store).data)


class ReportSectionListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
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
        report_section = report_section_service.submit_auditor_comment(audit_store.id, section.id, request.user.id, auditor_comment)
        return Response(ReportSectionSerializer(report_section).data)

class AuditGuidelineByAuditStore(APIView):
    permission_classes = [HasGroupPermission]
    required_grooups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self,request,audit_store_id,format=None):
        attachment = attachment_auditor_service.find_attachment_by_audit_store_id(audit_store_id)
        return Response(attachment)
    
def find_proof_tag_by_id(proof_tag_id):
    """Retrieve the proof tag by its ID or return None if not found or ID is None."""
    if proof_tag_id is None:
        return None
    try:
        return AuditCycleProofTagList.objects.get(pk=proof_tag_id)
    except AuditCycleProofTagList.DoesNotExist:
        raise NotFound({"detail": "Proof tag with ID " + str(proof_tag_id) + " does not exist."})

class AuditStoreAttachmentProofTagView(APIView):
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
            file_name = request.data.get("file_name")
            file_type = request.data.get("file_type")
            file_size = request.data.get("file_size")
            if file_name.lower().endswith(".heic"):
                file_type = '' 
            proof_tag_id = request.data.get("proof_tag", None)
            proof_tag = find_proof_tag_by_id(proof_tag_id)
            post_data, attachment = attachment_auditor_service.upload_for_audit_store_by_auditor_with_proof_tag(
                audit_store_id,
                request.user.id,
                file_name,
                file_size,
                file_type,
                proof_tag)
            post_data["attachment"] = AttachmentSerializer(attachment).data
            prooftag_not_available =  AuditProoftagNotAvailable.objects.filter(proof_tag=proof_tag_id,user=request.user.id,audit_store_id=audit_store_id)
            if prooftag_not_available.exists():
                prooftag_not_available.delete()
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })

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
            file_name = request.data.get("file_name")
            file_type = request.data.get("file_type")
            file_size = request.data.get("file_size")
            if file_name.lower().endswith(".heic"):
                file_type = '' 
            post_data, attachment = attachment_auditor_service.upload_for_audit_store_by_auditor(
                audit_store_id,
                request.user.id,
                file_name,
                file_size,
                file_type)
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
        
class AuditStoreProofTagNotAvailableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }

    def get(self, request, audit_store_id, format=None):
            user_id = request.user.id
            prooftag_not_available = attachment_auditor_service.find_by_audit_store_for_auditor_prooftag_not_available(audit_store_id, user_id)
            return Response(AuditProoftagSerializer(prooftag_not_available, many=True).data)

    def post(self, request, audit_store_id):
        proof_tag = request.data.get('proof_tag_id')
        description = request.data.get('description')
        user_id = request.user.id
        try:
            prooftag_not_available = attachment_auditor_service.upload_prooftag_not_available_for_audit_store_by_auditor(
                audit_store_id,
                user_id,
                proof_tag,
                description)
            return Response(AuditProoftagSerializer(prooftag_not_available).data)
        except KeyError as e:
            return Response( {"message": str(e)},status=400 )

class ProofTagNotAvailableView(APIView):
    # permission_classes = [AllowAny]
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
        'DELETE': [GROUP_NAME_AUDITOR]
    }
    def post(self, request, proof_not_available_id):
        description = request.data.get('description')
        user_id = request.user.id
        if not description:
            return Response( {"message": "The description field (description) is required."}, status=400 )
        try:
            prooftag_not_available = attachment_service.find_prooftag_not_available_by_id(proof_not_available_id,user_id)
            if not prooftag_not_available:
                raise NotFound("The specified proof tag not available record does not exist.")
            prooftag_not_available.description = description
            prooftag_not_available.save()
            return Response( AuditProoftagSerializer(prooftag_not_available).data, status=200 )
        except Exception as e:
            return Response( {"message": "An unexpected error occurred: " + str(e)}, status=500 )

    def delete(self, request,proof_not_available_id):
        user_id = request.user.id
        prooftag_not_available = attachment_service.find_prooftag_not_available_by_id(proof_not_available_id,user_id)
        prooftag_not_available.delete()
        return Response({"message": "prooftag_not_available deleted successfully"}, status=200)


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

class AnswerNotApplicableView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }
    class Deserializer(Serializer):
        not_applicable = BooleanField()

    def post(self, request, audit_store_id, question_id):   
        ds = self.Deserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        not_applicable = ds.validated_data.get('not_applicable')
        answer = answer_moderator_service.set_not_applicable_for_auditor(audit_store_id, question_id, not_applicable, request.user.id)
        return Response(AnswerSerializer(answer).data)

class UserIdProofAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR]
    }

    def get(self, request, format=None):
        attachments = attachment_auditor_service.find_id_proof_for_auditor(request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

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


class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_AUDITOR],
    }

    def delete(self, request, attachment_id):
        attachment_auditor_service.delete_for_auditor(attachment_id, request.user.id)
        return Response()

class AttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR],
    }

    def post(self, request, attachment_id):
        attachment = attachment_auditor_service.complete_for_auditor(attachment_id, request.user.id)
        return Response(AttachmentSerializer(attachment).data)

class MoveAttachmentToSection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST':[GROUP_NAME_AUDITOR],
    }

    def post(self,request,audit_store_id):
        attachment = attachment_auditor_service.move_to_section(audit_store_id,request.data['section_id'],request.data['attachment_list'])
        return Response(AttachmentSerializer(attachment).data)

class AuditStoreIdArrangeAttachment(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    def post(self, request, audit_store_id):
        audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, request.user.id)
        set_attachment_by_proof_tag(audit_store_id)
        return Response(AuditStoreSerializer(audit_store).data)

class NotificationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        notifications = notification_service.find_by_recipient_user_and_verb_and_actor(request.user.id)
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
        status = request.GET.get('status')
        payments, total_count = payment_service.get_payment_list_by_user(request.user.id,status,request.GET.get('is_load_more'), request.GET.get('last_total_count'))
        return Response({'payments': PaymentSerializer(payments, many=True).data, 'total_count': total_count})
    
class PaymentStatusView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self,request,format=None):
        user=request.user
        status = request.GET.get('status')
        payments, total_count = payment_service.get_payment_status_wise_list_by_user(user,status, request.GET.get('is_load_more'), request.GET.get('last_total_count'))
        return Response({'payments': PaymentSerializer(payments, many=True).data, 'total_count': total_count})


class PaymentSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        payments = payment_service.get_payment_summary_by_user(request.user.id)
        return Response(payments)

class PaymentConcernView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    class PaymentConcernDeSerializer(Serializer):
        message = CharField(max_length=4096, allow_blank=False)

    def post(self, request, payment_id):
        ds = self.PaymentConcernDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        message = ds.validated_data['message']
        payment = payment_service.payment_concern(payment_id, request.user.id, message)
        return Response(PaymentSerializer(payment).data)


class ReferralView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        referrals = referral_service.find_by_referred_by(request.user.id)
        return Response(ReferralSerializer(referrals, many=True).data)

class StatsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        auditor_history = auditor_dashboard_service.getAuditorStats(request.user.id)
        return Response(auditor_history)

class ProfilePercentageView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        return Response(auditor_dashboard_service.get_profile_percentage(request.user.id))

class ProfileCompletioneView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        return Response(auditor_dashboard_service.get_profile_completion(request.user.id))

class ScoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        auditor_score = auditor_dashboard_service.getAuditorScore(request.user.id)
        return Response(auditor_score)

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
    }
    STATIC_CONFIG ={
        "RHEA_PROTOCOL": settings.RHEA_PROTOCOL,
        "RHEA_DOMAIN": settings.RHEA_DOMAIN,
        "RHEA_BASE_URL": settings.RHEA_BASE_URL,
        "BRAND_NAME": settings.BRAND_NAME,
        "BRAND_SHORTNAME": settings.BRAND_SHORTNAME,
        **settings.FRONTEND_CONFIG["AUDITOR"],
        **settings.FRONTEND_CONFIG["COMMON"],
    }
    def get(self, request, format=None):
        response_data = {
            **self.STATIC_CONFIG,
            "USER_ID": request.user.id,
            "USER_EMAIL": request.user.email,
        }
        return Response(response_data)
    
    # def get(self, request, format=None):
    #     return Response({
    #         "USER_ID": request.user.id,
    #         "USER_EMAIL": request.user.email,
    #         "RHEA_PROTOCOL": settings.RHEA_PROTOCOL,
    #         "RHEA_DOMAIN": settings.RHEA_DOMAIN,
    #         "RHEA_BASE_URL": settings.RHEA_BASE_URL,
    #         "BRAND_NAME": settings.BRAND_NAME,
    #         "BRAND_SHORTNAME": settings.BRAND_SHORTNAME,
    #         **settings.FRONTEND_CONFIG["AUDITOR"],
    #         **settings.FRONTEND_CONFIG["COMMON"],
    #     })

class PreferencesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR],
        'POST': [GROUP_NAME_AUDITOR],
    }
    def get(self, request, format=None):
        preferences = preferences_service.find_preferences_by_user_id(request.user.id)
        return Response(PreferencesSerializer(preferences).data)

    def post(self, request):
        preferences_s = PreferencesSerializer(data=request.data, context={'current_user': request.user})
        preferences_s.is_valid(raise_exception=True)
        preferences = preferences_s.deserialize()
        preferences = preferences_service.save(preferences)
        return Response(PreferencesSerializer(preferences).data)

class TosAcceptView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    class DeSerializer(Serializer):
        tos_accept = BooleanField()

    def post(self, request):
        ds = TosAcceptView.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        preferences = preferences_service.tos_accept(request.user.id, ds.validated_data.get('tos_accept'))
        return Response(PreferencesSerializer(preferences).data)


class AttachmentProofTagList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, audit_cycle_id):
        proof_tag = audit_cycle_proof_tag.get_audit_cycle_proof_tag_for_attachment(audit_cycle_id)
        # return Response(AuditCycleProoftagListSerializer(proof_tag, many=True).data)
        return Response(proof_tag)


class AttachmentIdProofTagView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }
    def post(self, request, attachment_id):
        attachment = attachment_auditor_service.save_attachment_proof_tag(attachment_id, request.data['proof_tag_id'])
        return Response(AttachmentSerializer(attachment).data)
    
    

class ProfileInfoPronounsView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_pronouns_info = [{'value': choice[0], 'label': choice[1]} for choice in PronounsSerializer.PRONOUNS]
        return Response(all_pronouns_info)

class ProfileInfoGenderView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_gender_info = [{'value': choice[0], 'label': choice[1]} for choice in GenderSerializer.GENDER]
        return Response(all_gender_info)
    

class ProfileInfoMaritalStatusView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_marital_status_info = [{'value': choice[0], 'label': choice[1]} for choice in MaritalStatusSerializer.MARITAL_STATUS]
        return Response(all_marital_status_info)

class ProfileEducationInfoView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_education_info = [{'value': choice[0], 'label': choice[1]} for choice in EducationSerializer.EDUCATION]
        return Response(all_education_info)

class ProfileInfoIncomeView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_income_info = [{'value': choice[0], 'label': choice[1]} for choice in IncomeSerializer.INCOME]
        return Response(all_income_info)

class ProfileInfoAuditRatingView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_audit_rating_info = [{'value': choice[0], 'label': choice[1]} for choice in AuditorRatingSerializer.AUDITOR_RATING]
        return Response(all_audit_rating_info)
    
class ProfileInfoOccupationView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET':[GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_occupation_info = [{'value': choice[0], 'label': choice[1]} for choice in OccupationSerializer.OCCUPATION]
        return Response(all_occupation_info)
    
class ProfileInfoDistanceView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET':[GROUP_NAME_AUDITOR]
    }
    def get(self,request, format=None):
        all_distance_info = [{'value':choice[0], 'label':choice[1]} for choice in DistanceSerializer.DISTANCE]
        return Response(all_distance_info)

class ProfileInfoIndustryView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET':[GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_industry_info = [{'value': choice[0], 'label': choice[1]} for choice in IndustrySerializer.INDUSTRY]
        return Response(all_industry_info)
    
class ProfileInfoCarCostView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET':[GROUP_NAME_AUDITOR]
    }
    def get(self,request,format=None):
        all_car_cost_info = [{'value':choice[0], 'label': choice[1]} for choice in CarCostSerializer.CAR_COST]
        return Response(all_car_cost_info)
    
class ProfileInfoResolutionView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'GET': [GROUP_NAME_AUDITOR]
    }
    def get(self, request, format=None):
        all_resolution_info = [{'value':choice[0],'label':choice[1]} for choice in ResolutionSerializer.RESOLUTION]
        return Response(all_resolution_info)


class AuditorSelfDeactivateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }
    def post(self, request, user_id):
        user=request.user.id
        user = auditor_service.deactivate_auditor(user)
        return Response(AuditorSerializer(user).data)