from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

import attachment.service_manager as attachment_manager_service
from ..serializers import AttachmentSerializer

class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
        }

    def get(self, request, audit_store_id, format=None):
        try:
            attachments = attachment_manager_service.find_by_audit_store_for_manager(audit_store_id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

    def post(self, request, audit_store_id):
        try:
            post_data, attachment = attachment_manager_service.upload_for_audit_store_for_manager(
                    audit_store_id,
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
            'GET': [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
        }

    def get(self, request, audit_store_id, section_id, format=None):
        try:
            attachments = attachment_manager_service.find_by_audit_store_and_section_for_manager(audit_store_id, section_id, request.user.id)
            return Response(AttachmentSerializer(attachments, many=True).data)
        except ObjectNotFound:
            raise NotFound

    def post(self, request, audit_store_id, section_id):
        try:
            post_data, attachment = attachment_manager_service.upload_for_report_section_for_manager(
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
            'DELETE': [GROUP_NAME_MANAGER],
        }

    def delete(self, request, attachment_id):
        try:
            attachment_manager_service.delete_for_manager(attachment_id)
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
            'POST': [GROUP_NAME_MANAGER],
        }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_manager_service.rename_for_manager(attachment_id, request.data["file_name"])
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


class AttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER],
        }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_manager_service.complete_for_manager(attachment_id)
            return Response(AttachmentSerializer(attachment).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })
