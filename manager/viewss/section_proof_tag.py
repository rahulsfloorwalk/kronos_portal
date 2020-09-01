from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from questionnaire.service import section_proof_tag

class SectionProofTag(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, section_id):
        section_proof_tags = section_proof_tag.get_section_proof_tag(section_id)
        return Response(section_proof_tags)

    def post(self, request, section_id):
        section_proof_tags = section_proof_tag.save_section_proof_tag(section_id, request.data['audit_cycle_id'],
                                                                      request.data['proof_tag_list'])
        return Response(section_proof_tags)
