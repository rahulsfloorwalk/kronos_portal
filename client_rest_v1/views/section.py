from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer, IntegerField

from registration.models import GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission

from questionnaire.service import section as section_service

from manager.viewss.question import QuestionSerializer

from questionnaire.models import Section

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
            'max_marks'
        )
        read_only_fields = fields


class SectionDeSerializer(ModelSerializer):
    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'audit_cycle',
            'sequence',
            'minimum_attachment_count',
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
        return section


class SectionViewByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_cycle_id, format=None):
        sections = section_service.find_by_audit_cycle(audit_cycle_id)
        return Response(SectionSerializer(sections, many=True).data)

class SectionCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
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
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
        'DELETE': [GROUP_NAME_CLIENT]
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
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request):
        section_ds = SectionDeSerializer(data=request.data)
        section_ds.is_valid(raise_exception=True)
        section = section_ds.deserialize()
        savedSection = section_service.save(section)
        return Response(SectionSerializer(savedSection).data)
