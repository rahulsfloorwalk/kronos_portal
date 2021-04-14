from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

# from ..serializers import ProofTagSerializer, AuditCycleSerializer, AuditCycleProofTagListSerializer
from ..serializers import ProofTagSerializer, AuditCycleSerializer
from ..service import proof_tag as proof_tag_service
from audit.service import audit_cycle_proof_tag as audit_cycle_proof_tag_service

class ProofTagDeSerializer(Serializer):
    name = CharField(min_length=1, max_length=200, allow_blank=False)
    description = CharField(max_length=1000, allow_blank=True)
    is_active = BooleanField()

class ProofTagView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        proof_tags = proof_tag_service.find_all()
        return Response(ProofTagSerializer(proof_tags, many=True).data)

    def post(self, request):
        proof_tag_ds = ProofTagDeSerializer(data=request.data)
        proof_tag_ds.is_valid(raise_exception=True)
        proof_tag_obj = proof_tag_service.insert(
            proof_tag_ds.validated_data['name'],
            proof_tag_ds.validated_data['description'],
            proof_tag_ds.validated_data['is_active']
        )
        return Response(ProofTagSerializer(proof_tag_obj).data)

class ProofTagIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, proof_tag_id, format=None):
        proof_tag = proof_tag_service.find_by_id(proof_tag_id)
        return Response(ProofTagSerializer(proof_tag).data)

    def post(self, request, proof_tag_id):
        proof_tag_ds = ProofTagDeSerializer(data=request.data)
        proof_tag_ds.is_valid(raise_exception=True)
        proof_tag_obj = proof_tag_service.update(
            proof_tag_id,
            proof_tag_ds.validated_data['name'],
            proof_tag_ds.validated_data['description'],
            proof_tag_ds.validated_data['is_active']
        )
        return Response(ProofTagSerializer(proof_tag_obj).data)


class AuditCycleProofTag(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_cycle_id):
        proof_tag = audit_cycle_proof_tag_service.get_audit_cycle_proof_tag(audit_cycle_id)
        return Response(proof_tag)

    def post(self, request, audit_cycle_id):
        audit_cycle = audit_cycle_proof_tag_service.save_proof_tag(audit_cycle_id, request.data['proof_tag_list'])
        return Response(AuditCycleSerializer(audit_cycle).data)


class AttachmentAuditCycleProofTagList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request, audit_cycle_id):
        proof_tags = audit_cycle_proof_tag_service.get_audit_cycle_proof_tag_for_attachment(audit_cycle_id)
        # return Response(AuditCycleProofTagListSerializer(proof_tags, many=True).data)
        return Response(proof_tags)
