from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import section as section_service

from ..serializers import SectionSerializer, SectionDeSerializer


class SectionViewByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        sections = section_service.find_by_audit_cycle(audit_cycle_id)
        return Response(SectionSerializer(sections, many=True).data)

class SectionCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, to_audit_cycle_id, format=None):
        sections = section_service.copy_sections_from_to(request.data.get('from_audit_cycle_id'), to_audit_cycle_id)
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
