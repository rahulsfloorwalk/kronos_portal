from django.contrib.contenttypes.models import ContentType

from notifications.models import Notification

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, RelatedField

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR, GROUP_NAME_MODERATOR, GROUP_NAME_AGENCY
from audit.models import Audit
from auditor.models import AuditApplication
from audit_store.models import AuditStore
from payment.models import Payment

from manager.serializers import PlainUserSerializer, AuditSerializer, AuditStoreSerializer
from manager.serializers import AuditApplicationSerializer
from manager.serializers import PaymentSerializer
from manager.serializers import UserSerializer
from manager.service import notifications as notification_service

class ContentTypeSerializer(ModelSerializer):
    class Meta:
        model = ContentType
        fields = ('app_label','model')
        read_only_fields = fields


class NotificationSerializer(ModelSerializer):
    class NotificationTargetField(RelatedField):
        def to_representation(self, value):
            if isinstance(value, Audit):
                serializer = AuditSerializer(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
            elif isinstance(value, AuditApplication):
                serializer = AuditApplicationSerializer(value)
            else:
                raise ValueError('Unexpected type of target object in notification: ', type(value))
            return serializer.data

    class NotificationActionObjectField(RelatedField):
        def to_representation(self, value):
            if isinstance(value, AuditApplication):
                serializer = AuditApplicationSerializer(value)
            elif isinstance(value, AuditStore):
                serializer = AuditStoreSerializer(value)
            elif isinstance(value, Payment):
                serializer = PaymentSerializer(value)
            else:
                raise ValueError('Unexpected type of action object in notification: ', type(value))
            return serializer.data

    class NotificationActorField(RelatedField):
        def to_representation(self, value):
            if value.groups.filter(name=GROUP_NAME_MANAGER).exists():
                serializer = PlainUserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_AUDITOR).exists():
                serializer = UserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_MODERATOR).exists():
                serializer = PlainUserSerializer(value)
            elif value.groups.filter(name=GROUP_NAME_AGENCY).exists():
                serializer = UserSerializer(value)
            else:
                raise ValueError("Cannot serialize user with unknown user groups:{}".format(value.groups.all()))
            return serializer.data

    actor = NotificationActorField(read_only=True)
    actor_content_type = ContentTypeSerializer()

    target = NotificationTargetField(read_only=True)
    target_content_type = ContentTypeSerializer()

    action_object = NotificationActionObjectField(read_only=True)
    action_object_content_type = ContentTypeSerializer()

    class Meta:
        model = Notification
        fields = (
            'id',
            'unread',
            'timestamp',
            'level',
            'verb',
            'description',
            'recipient',

            'actor',
            'actor_content_type',

            'target',
            'target_content_type',

            'action_object',
            'action_object_content_type',
        )
        read_only_fields = fields


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
