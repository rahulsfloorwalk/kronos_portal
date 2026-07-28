from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer, IntegerField,SerializerMethodField
from rest_framework.permissions import AllowAny

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import section as section_service

from manager.viewss.question import QuestionSerializer

from questionnaire.models import Section,Question
from questionnaire.service.section_proof_tag import get_section_proof_tag_for_preview

class SectionSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'questions',
            'minimum_attachment_count',
            'max_marks',
            'hide_comment',
        )
        read_only_fields = fields

    # def get_questions(self, obj):
    #     questions = obj.questions.filter(
    #         visibility__in=[Question.VISIBLE_TO_ALL, Question.HIDE_FROM_CLIENT]
    #     )
    #     return QuestionSerializer(questions, many=True).data


class QuestionnaireSectionPreviewSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True)
    proof_tags = SerializerMethodField()

    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'questions',
            'minimum_attachment_count',
            'max_marks',
            'hide_comment',
            'proof_tags',
        )
        read_only_fields = fields

    def get_proof_tags(self, obj):
        return get_section_proof_tag_for_preview(obj.id)

class SectionDeSerializer(ModelSerializer):
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'minimum_attachment_count',
            'hide_comment',
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            section = Section.objects.get(id=self.context.get('id'))
        else:
            section = Section()
        section.name = self.validated_data['name']
        section.sequence = self.validated_data['sequence']
        section.audit_cycle = self.validated_data['audit_cycle']
        section.minimum_attachment_count = self.validated_data['minimum_attachment_count']
        section.hide_comment = self.validated_data['hide_comment']
        return section


class SectionViewByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        sections = section_service.find_by_audit_cycle(audit_cycle_id)
        return Response(SectionSerializer(sections, many=True).data)


class QuestionnairePreviewView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id, format=None):
        sections = section_service.find_by_audit_cycle(audit_cycle_id)
        return Response(QuestionnaireSectionPreviewSerializer(sections, many=True).data)
    

class SectionCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        from_audit_cycle_id = IntegerField()

    def post(self, request, to_audit_cycle_id, format=None):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        sections = section_service.copy_sections_from_to(ds.validated_data["from_audit_cycle_id"], to_audit_cycle_id)
        return Response(SectionSerializer(sections, many=True).data)


class SectionIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, section_id, format=None):
        section = section_service.find_section_by_id(section_id)
        return Response(SectionSerializer(section).data)

    def post(self, request, section_id):
        section_ds = SectionDeSerializer(data=request.data, context={'id':section_id})
        section_ds.is_valid(raise_exception=True)
        section = section_ds.deserialize()
        savedSection = section_service.save(section)
        return Response(SectionSerializer(savedSection).data)

    def delete(self, request, section_id):
        section_service.delete_section_by_id(section_id)
        return HttpResponse(status=204)

class SectionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        section_ds = SectionDeSerializer(data=request.data)
        section_ds.is_valid(raise_exception=True)
        section = section_ds.deserialize()
        savedSection = section_service.save(section)
        return Response(SectionSerializer(savedSection).data)
