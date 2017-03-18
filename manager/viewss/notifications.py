from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import NotificationSerializer
from ..service import notifications as notification_service


class NotificationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, format=None):
        try:
            notifications = notification_service.find_by_user(request.user.id)
            return Response(NotificationSerializer(notifications, many=True).data)
        except ObjectNotFound as e:
            raise NotFound from e

