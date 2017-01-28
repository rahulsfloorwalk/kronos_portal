from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import section as section_service

from questionnaire.models import Section
from ..serializers import SectionSerializer, SectionDeSerializer


class SectionViewByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, audit_cycle_id, format=None):
        try:
            sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).all()
            return Response(SectionSerializer(sections, many=True).data)
        except Section.DoesNotExist:
            raise Http404

class SectionIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, section_id, format=None):
        try:
            section = Section.objects.get(pk=section_id)
            return Response(SectionSerializer(section).data)
        except Section.DoesNotExist:
            return Http404

    def post(self, request, section_id):
        section_ds = SectionDeSerializer(data=request.data, context={'id':section_id})
        section_ds.is_valid(raise_exception=True)
        section = section_ds.deserialize()
        savedSection = section_service.save(section)
        return Response(SectionSerializer(savedSection).data)

    def delete(self, request, section_id):
        try:
            section = Section.objects.get(section_id)
            section.delete()
            return Response(SectionSerializer(section).data)
        except Section.DoesNotExist:
            raise Http404

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
