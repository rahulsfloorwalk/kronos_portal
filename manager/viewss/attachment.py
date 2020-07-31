from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

import attachment.service_manager as attachment_manager_service
from attachment.models import Attachment

class AttachmentSerializer(ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            'id',
            'file_slug',
            'proof_type',
            'mime_type',
            'file_name',
            'status',
            'content_type',
            'object_id',
            'direct_url',
            'extra',
            'faulty_report_id',
            'proof_tag'
        )
        read_only_fields = fields

class AuditStoreAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_store_id, format=None):
        attachments = attachment_manager_service.find_by_audit_store_for_manager(audit_store_id)
        return Response(AttachmentSerializer(attachments, many=True).data)

    def post(self, request, audit_store_id):
        try:
            post_data, attachment = attachment_manager_service.upload_for_audit_store_for_manager(
                audit_store_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError:
            raise ValidationError({
                'file_name': "file name is required"
            })

class ReportSectionAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_store_id, section_id, format=None):
        attachments = attachment_manager_service.find_by_audit_store_and_section_for_manager(audit_store_id, section_id, request.user.id)
        return Response(AttachmentSerializer(attachments, many=True).data)

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
        except KeyError:
            raise ValidationError({
                'file_name': "file name is required"
            })

class AttachmentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }

    def delete(self, request, attachment_id):
        attachment_manager_service.delete_for_manager(attachment_id)
        return Response()


class AttachmentIdRenameView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, attachment_id):
        try:
            attachment = attachment_manager_service.rename_for_manager(attachment_id, request.data["file_name"])
            return Response(AttachmentSerializer(attachment).data)
        except KeyError:
            raise ValidationError({
                'file_name': "file name is required"
            })


class AttachmentIdRotateView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, attachment_id):
        attachment = attachment_manager_service.rotate_attachment_for_manager(attachment_id, request.data["angle"])
        return Response(AttachmentSerializer(attachment).data)


class AttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, attachment_id):
        attachment = attachment_manager_service.complete_for_manager(attachment_id)
        return Response(AttachmentSerializer(attachment).data)

class MoveAttachmentToSection(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST':[GROUP_NAME_MANAGER],
    }

    def post(self,request,audit_store_id):
        attachment = attachment_manager_service.move_to_section(audit_store_id,request.data['section_id'],request.data['attachment_list'])
        return Response(AttachmentSerializer(attachment).data)

class AttachmentIdProofTagView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, attachment_id):
        attachment = attachment_manager_service.save_attachment_proof_tag(attachment_id, request.data['proof_tag_id'])
        return Response(AttachmentSerializer(attachment).data)
