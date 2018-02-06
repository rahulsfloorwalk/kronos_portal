from rest_framework.views import APIView
from rest_framework.response import Response
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import NotificationSerializer
from ..serializers import PlainUserSerializer
from ..service import notifications as notification_service


class NotificationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        notifications = notification_service.find_by_recipient_user_and_verb_and_actor(
            request.user.id,
            request.GET.get('verb'),
            request.GET.get('before'),
            request.GET.get('actor')
        )
        return Response(NotificationSerializer(notifications, many=True).data)

class NotificationActorsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        return Response(PlainUserSerializer(notification_service.find_filterable_actors(), many=True).data)
