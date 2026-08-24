from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer, ListField
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField
from rest_framework.permissions import AllowAny,IsAuthenticated

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer,PlainmoderatorUserSerializer
from client.service import client_service
from client.service import client_manager as client_manager_service
from client.models import ClientManager, Client, ClientModerator,DashboardWidgetvisibilityAccess
from ..service import moderator as moderator_service
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User


class ClientManagerSerializer(ModelSerializer):
    user = PlainUserSerializer()
    class Meta:
        model = ClientManager
        fields = (
            'id',
            'client',
            'user',
            'receive_email_notification',
            'is_active'
        )
        read_only_fields = fields
class QAUserSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'is_active',
        )
        read_only_fields = fields

class ClientModeratorSerializer(ModelSerializer):
    user = PlainmoderatorUserSerializer()
    class Meta:
        model = ClientModerator
        fields = (
            'id',
            'client',
            'user',
            'receive_email_notification',
            'is_active'
        )
        read_only_fields = fields

class PlainClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = ('id','name','email',)
        read_only_fields = fields

class DashboardWidgetAccessSerializer(ModelSerializer):
    client = PlainClientSerializer(read_only=True)
    class Meta:
        model = DashboardWidgetvisibilityAccess
        fields = (
            'id',
            'client',
            'latest_audit_cycle_score',
            'upcoming_audits',
            'net_promoter_score',
            'section_summary',
            'improvement_areas_based_on_observation',
            'overall_high_performance_store',
            'branch_performance',
            'overall_high_performance_city',
            'overall_low_performance_store',
            'overall_low_performance_city',
            'questionnaire_summary',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id','client','created_at','updated_at',)

    def deserialize(self):
        if self.context.get('id') is not None:
            widget_access = DashboardWidgetvisibilityAccess.objects.get(id=self.context.get('id'))
        else:
            widget_access = DashboardWidgetvisibilityAccess(client=self.context.get('client'))

        widget_access.overall_audit_cycle_score = self.validated_data.get('latest_audit_cycle_score',widget_access.latest_audit_cycle_score)
        widget_access.upcoming_audits = self.validated_data.get('upcoming_audits',widget_access.upcoming_audits)
        widget_access.net_promoter_score = self.validated_data.get('net_promoter_score',widget_access.net_promoter_score)
        widget_access.section_summary = self.validated_data.get('section_summary',widget_access.section_summary)
        widget_access.improvement_areas_based_on_observation = self.validated_data.get('improvement_areas_based_on_observation',widget_access.improvement_areas_based_on_observation)
        # widget_access.overall_high_performance_store = self.validated_data.get('overall_high_performance_store',widget_access.overall_high_performance_store)
        widget_access.branch_performance = self.validated_data.get('branch_performance',widget_access.branch_performance)
        widget_access.city_wise_performance = self.validated_data.get('overall_high_performance_city',widget_access.overall_high_performance_city)
        widget_access.store_wise_performance = self.validated_data.get('overall_low_performance_store',widget_access.overall_low_performance_store)
        # widget_access.overall_low_performance_city = self.validated_data.get('overall_low_performance_city',widget_access.overall_low_performance_city)
        widget_access.questionnaire_summary = self.validated_data.get('questionnaire_summary',widget_access.questionnaire_summary)

        return widget_access

class ClientModeratorDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    moderator = ListField(child=IntegerField())
    receive_email_notification = BooleanField()
    is_active = BooleanField()

class ClientManagerDeSerializer(Serializer):
    client = PrimaryKeyRelatedField(queryset=Client.objects.all())
    manager = IntegerField()
    receive_email_notification = BooleanField()
    is_active = BooleanField()


class ClientManagerByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        client_managers = client_service.find_client_by_id(client_id).managers
        return Response(ClientManagerSerializer(client_managers, many=True).data)

class ClientModeratorByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        client_moderators = client_service.find_client_by_id(client_id).moderator
        client_moderators.filter(user__is_active=False,is_active=True).update(is_active=False)
        # client_moderators = client_moderators.filter(is_active=True).select_related('user')

        return Response(ClientModeratorSerializer(client_moderators, many=True).data)
    
class ClientModeratorByClientwiseView(APIView):
    permission_classes = [AllowAny]

    # required_groups = {
    #     'GET': [GROUP_NAME_MANAGER]
    # }

    def get(self, request, client_id):

        audit_cycle_id = request.GET.get('audit_cycle_id', '')
        user_id = request.GET.get('user_id', '')
        city = request.GET.get('city', '')
        status = request.GET.get('status', '')
        qa_id = request.GET.get('qa_id', '')

        client_moderators = (
            client_service
            .find_client_moderators_with_filters(
                client_id=client_id,
                audit_cycle_id=audit_cycle_id,
                user_id=user_id,
                city=city,
                status=status,
                qa_id=qa_id
            )
        )

        return Response(
            ClientModeratorSerializer(
                client_moderators,
                many=True
            ).data
        )
    
class ClientModeratorAssignView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_id):
        users = moderator_service.find_all()
        assigned_ids = ClientModerator.objects.filter(client_id=client_id,is_active=True).values_list("user_id", flat=True)

        response_data = []
        for user in users:
            # if user.id not in assigned_ids:
            response_data.append({"id": user.id,"email": user.email,"assigned": user.id in assigned_ids})
        return Response(response_data)

class ClientDashboardWidgetVisibilityAccessView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    def get(self, request, client_id):
        client = get_object_or_404(Client, pk=client_id)
        widget_access, created = (DashboardWidgetvisibilityAccess.objects.get_or_create(client=client))
        serializer = DashboardWidgetAccessSerializer(widget_access)
        return Response(serializer.data)

    def post(self, request, client_id):
        client = get_object_or_404(Client, pk=client_id)
        widget_access, created = (DashboardWidgetvisibilityAccess.objects.get_or_create(client=client))
        serializer = DashboardWidgetAccessSerializer(widget_access,data=request.data,partial=True,context={'id': widget_access.id,'client': client})

        serializer.is_valid(raise_exception=True)
        widget_access = serializer.deserialize()
        widget_access.save()
        return Response(DashboardWidgetAccessSerializer(widget_access).data)

class ClientModeratorView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        client_moderator_ds = ClientModeratorDeSerializer(data=request.data)
        client_moderator_ds.is_valid(raise_exception=True)
        saved_client_moderator = client_manager_service.insert_moderators(
            client_moderator_ds.validated_data["client"],
            client_moderator_ds.validated_data["moderator"],
            client_moderator_ds.validated_data["receive_email_notification"],
            client_moderator_ds.validated_data["is_active"]
        )
        return Response(ClientModeratorSerializer(saved_client_moderator, many=True).data)
    
class ClientManagerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        client_manager_ds = ClientManagerDeSerializer(data=request.data)
        client_manager_ds.is_valid(raise_exception=True)
        saved_client_manager = client_manager_service.insert(
            client_manager_ds.validated_data["client"],
            client_manager_ds.validated_data["manager"],
            client_manager_ds.validated_data["receive_email_notification"],
            client_manager_ds.validated_data["is_active"]
        )
        return Response(ClientManagerSerializer(saved_client_manager).data)


class ClientManagerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_manager_id):
        client_manager = client_manager_service.find_client_manager_by_id(client_manager_id)
        return Response(ClientManagerSerializer(client_manager).data)

    def post(self, request, client_manager_id):
        client_manager = client_manager_service.update(client_manager_id,
                                                       request.data['receive_email_notification'],
                                                       request.data['is_active'])
        return Response(ClientManagerSerializer(client_manager).data)

class ClientModeratorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }

    def get(self, request, client_moderator_id):
        client_moderator = client_manager_service.find_client_moderator_by_id(client_moderator_id)
        return Response(ClientModeratorSerializer(client_moderator).data)

    def post(self, request, client_moderator_id):
        client_moderator = client_manager_service.update_moderator(client_moderator_id,
                                                       request.data['receive_email_notification'],
                                                       request.data['is_active'])
        return Response(ClientModeratorSerializer(client_moderator).data)
