from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField, IntegerField, PrimaryKeyRelatedField
from rest_framework.views import APIView

from registration.models import GROUP_NAME_AGENCY
from registration.mixins import HasGroupPermission

from agency.models import AgencyPresence

from manager.service import city_service
from manager.states import states
from manager.models import City

from agency_rest.serializers import AgencySerializer
from agency_rest.serializers import AgencyPresenceSerializer
from agency_rest.serializers import CitySerializer
from agency_rest.serializers import UserSerializer
from agency_rest.serializers import AnswerSerializer
from agency_rest.serializers import ReportSectionSerializer
from agency_rest.serializers import SectionSerializer
from agency_rest.serializers import AttachmentSerializer
from agency_rest.serializers import AuditStoreSerializer

from audit_store.models import AuditStore
from audit_store import service_agency as audit_store_service

from answer.service import answer_agency as answer_service
from answer.service import report_section_agency as report_section_service
from attachment import service_agency as attachment_agency_service

from questionnaire.service import section as section_service
from questionnaire.models import Section


class StateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
    }
    def get(self, request, format=None):
        return Response(states)

class CityView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
    }
    def get(self, request, state_code, format=None):
        cities = city_service.find_cities_by_state_code(state_code)
        return Response(CitySerializer(cities, many=True).data)

class AgencyView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
        'POST': [GROUP_NAME_AGENCY],
    }
    def get(self, request, format=None):
        agency = request.user.agencyuser.agency
        return Response(AgencySerializer(agency).data)
    def post(self, request, format=None):
        agency = request.user.agencyuser.agency
        agency_ds = AgencySerializer(agency, data=request.data)
        agency_ds.is_valid(raise_exception=True)
        agency_ds.save()
        return Response(agency_ds.data)

class AgencyPresencePresentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY],
        'DELETE': [GROUP_NAME_AGENCY],
    }

    def post(self, request, city_id, format=None):
        city = get_object_or_404(City, pk=city_id)
        presence = AgencyPresence.objects.find_by_user_and_city(request.user, city)
        presence.set_presence(True)
        return Response(AgencyPresenceSerializer(presence).data)

    def delete(self, request, city_id, format=None):
        city = get_object_or_404(City, pk=city_id)
        presence = AgencyPresence.objects.find_by_user_and_city(request.user, city)
        presence.set_presence(False)
        return Response(AgencyPresenceSerializer(presence).data)

class AgencyPresenceByStateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
    }
    def get(self, request, state_code, format=None):
        presences = AgencyPresence.objects.find_by_user_and_state(request.user, state_code)
        return Response(AgencyPresenceSerializer(presences, many=True).data)

class UserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
    }
    def get(self, request, format=None):
        return Response(UserSerializer(request.user).data)

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
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
            **settings.FRONTEND_CONFIG["AGENCY"],
            **settings.FRONTEND_CONFIG["COMMON"],
        })


class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY]
    }
    def get(self, request, audit_store_id, format=None):
        sections = section_service.find_by_audit_store_for_agency(audit_store_id, request.user.id)
        return Response(SectionSerializer(sections, many=True).data)


class AnswerSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY]
    }

    class AnswerDeserializer(Serializer):
        answer_text = CharField()

    def post(self, request, audit_store_id, question_id, format=None):
        ds = self.AnswerDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_text = ds.validated_data.get('answer_text')
        answer = answer_service.submit_answer_by_agency(audit_store_id, question_id, request.user.id, answer_text)
        return Response(AnswerSerializer(answer).data)


class AnswerCommentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY]
    }

    class AnswerDeserializer(Serializer):
        answer_comment = CharField()

    def post(self, request, audit_store_id, question_id, format=None):
        ds = self.AnswerDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        answer_comment = ds.validated_data.get('answer_comment')
        answer = answer_service.set_answer_comment_by_agency(audit_store_id, question_id, request.user.id,
                                                             answer_comment)
        return Response(AnswerSerializer(answer).data)


class AnswerListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY]
    }

    def get(self, request, audit_store_id, format=None):
        answers = answer_service.find_by_audit_store_for_agency(audit_store_id, request.user.id)
        return Response(AnswerSerializer(answers, many=True).data)


class ReportSectionListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY]
    }
    def get(self, request, audit_store_id, format=None):
        report_sections = report_section_service.find_by_audit_store_for_agency(audit_store_id, request.user.id)
        return Response(ReportSectionSerializer(report_sections, many=True).data)


class AuditStoreIdSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_service.submit_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class AuditStoreIdAcknowledgeView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY],
    }
    def post(self, request, audit_store_id):
        audit_store = audit_store_service.acknowledge_report(audit_store_id, request.user.id)
        return Response(AuditStoreSerializer(audit_store).data)


class CommentSubmitView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY]
    }

    class ReportSectionDeSerializer(Serializer):
        auditor_comment = CharField(max_length=2048, allow_blank=True)

    def post(self, request, audit_store_id,  section_id, format=None):
        ds = self.ReportSectionDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        auditor_comment = ds.validated_data['auditor_comment']
        report_section = report_section_service.submit_auditor_comment_for_agency(audit_store_id, section_id, request.user.id, auditor_comment)
        return Response(ReportSectionSerializer(report_section).data)


class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
        'POST': [GROUP_NAME_AGENCY]
    }

    class AttachmentDeserializer(Serializer):
        file_name = CharField()
        file_size = IntegerField()
        file_type = CharField()

    def get(self, request, audit_store_id, format=None):
            attachments = attachment_agency_service.find_by_audit_store_for_agency(audit_store_id, request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id):
        ds = self.AttachmentDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        file_name = ds.validated_data.get('file_name')
        file_size = ds.validated_data.get('file_size')
        file_type = ds.validated_data.get('file_type')
        post_data, attachment = attachment_agency_service.upload_for_audit_store_by_agency(
            audit_store_id,
            file_name,
            file_size,
            file_type,
            request.user.id)
        post_data["attachment"] = AttachmentSerializer(attachment).data
        return Response(post_data)


class ReportSectionAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_AGENCY],
        'POST': [GROUP_NAME_AGENCY]
    }

    class AttachmentDeserializer(Serializer):
        file_name = CharField()
        file_size = IntegerField()
        file_type = CharField()

    def get(self, request, audit_store_id, section_id, format=None):
        attachments = attachment_agency_service.find_by_audit_store_and_section_for_agency(audit_store_id, section_id, request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id, section_id):
        ds = self.AttachmentDeserializer(data=request.data)
        ds.is_valid(raise_exception=True)
        file_name = ds.validated_data.get('file_name')
        file_size = ds.validated_data.get('file_size')
        file_type = ds.validated_data.get('file_type')
        post_data, attachment = attachment_agency_service.upload_for_report_section_by_agency(
            audit_store_id,
            section_id,
            file_name,
            file_size,
            file_type,
            request.user.id)
        post_data["attachment"] = AttachmentSerializer(attachment).data
        return Response(post_data)


class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_AGENCY],
    }

    def delete(self, request, attachment_id):
        attachment_agency_service.delete_for_agency(attachment_id, request.user.id)
        return Response()


class AttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_AGENCY],
    }

    def post(self, request, attachment_id):
        attachment = attachment_agency_service.complete_for_agency(attachment_id, request.user.id)
        return Response(AttachmentSerializer(attachment).data)

