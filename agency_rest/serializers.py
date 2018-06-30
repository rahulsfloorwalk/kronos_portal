
from django.contrib.auth.models import User

from rest_framework.serializers import ModelSerializer

from manager.models import City
from registration.models import MobileNumber

from agency.models import Agency
from agency.models import AgencyUser
from agency.models import AgencyPresence

from answer.models import Answer, ReportSection
from questionnaire.models import Question, Section


class AgencySerializer(ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            'id',
            'name',
            'formed_in_year',
            'gstin',
            'cin',
            'strength',
        )
        read_only_fields = ('id',)

class AgencyUserSerializer(ModelSerializer):
    agency = AgencySerializer()
    class Meta:
        model = AgencyUser
        fields = (
            'id',
            'full_name',
            'agency',
            'user_id',
        )
        read_only_fields = fields

class MobileNumberSerializer(ModelSerializer):
    class Meta:
        model = MobileNumber
        fields = (
            'id',
            'mobile_number',
            'is_verified',
            'user_id',
        )
        read_only_fields = fields

class UserSerializer(ModelSerializer):
    agencyuser = AgencyUserSerializer()
    mobile_numbers = MobileNumberSerializer(many=True)
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'agencyuser',
            'mobile_numbers',
        )

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'name',
            'state',
        )

class AgencyPresenceSerializer(ModelSerializer):
    class Meta:
        model = AgencyPresence
        fields = (
            'id',
            'present',
            'agency_id',
            'city_id',
        )
        read_only_fields = fields


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'sequence',
            'question_txt',
            'question_type',
            'question_data',
            'section',
        )
        read_only_fields = fields


class SectionSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'questions'
        )
        read_only_fields = fields


class AnswerSerializer(ModelSerializer):
    class Meta:
        model = Answer
        fields = (
            'id',
            'question_id',
            'audit_store_id',
            'answer_text',
            'answer_comment',
        )
        read_only_fields = fields


class ReportSectionSerializer(ModelSerializer):
    class Meta:
        model = ReportSection
        fields = (
            'id',
            'audit_store',
            'section',
            'auditor_comment'
        )
        read_only_fields = fields