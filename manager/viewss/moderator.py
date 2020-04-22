from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, IntegerField
from rest_framework.serializers import EmailField, CharField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.service import moderator_summary
from ..serializers import PlainUserSerializer
from ..service import moderator as moderator_service
import audit_store.service_manager as audit_store_service
from manager.serializers import AuditStoreSerializer

class ModeratorDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()

class ModeratorView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        users = moderator_service.find_all()
        return Response(PlainUserSerializer(users, many=True).data)

    def post(self, request):
        moderator_ds = ModeratorDeSerializer(data=request.data)
        moderator_ds.is_valid(raise_exception=True)
        saved_client_user = moderator_service.insert(
            moderator_ds.validated_data["email"],
            moderator_ds.validated_data["password"],
            moderator_ds.validated_data["is_active"]
        )
        return Response(PlainUserSerializer(saved_client_user).data)

class ModeratorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, user_id, format=None):
        user = moderator_service.find_by_id(user_id)
        return Response(PlainUserSerializer(user).data)

    def post(self, request, user_id):
        moderator_ds = ModeratorDeSerializer(data=request.data)
        moderator_ds.is_valid(raise_exception=True)
        saved_user = moderator_service.update(
            user_id,
            moderator_ds.validated_data["email"],
            moderator_ds.validated_data["password"],
            moderator_ds.validated_data["is_active"]
        )
        return Response(PlainUserSerializer(saved_user).data)


class ModeratorByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id):
        users = moderator_service.find_by_audit_cycle(audit_cycle_id)
        return Response(PlainUserSerializer(users, many=True).data)

    class DeSerializer(Serializer):
        user_id = IntegerField()

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_user = moderator_service.assign_audit_cycle(
            ds.validated_data["user_id"],
            audit_cycle_id
        )
        return Response(PlainUserSerializer(saved_user).data)

    def delete(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_user = moderator_service.revoke_audit_cycle(
            ds.validated_data["user_id"],
            audit_cycle_id
        )
        return Response(PlainUserSerializer(saved_user).data)


class ModeratorSummaryByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, audit_cycle_id):
        return Response(moderator_summary.moderator_summary_for_audit_cycle(audit_cycle_id))

class ModeratorSummaryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request):
        return Response(moderator_summary.moderator_summary_global())


class ModeratorReportList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, user_id):
        audit_stores = audit_store_service.find_qa_pending_audit_stores_of_moderator_for_manager(user_id)
        return Response(AuditStoreSerializer(audit_stores, many=True).data)
