from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.serializers import Serializer, IntegerField

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import PlainUserSerializer, ModeratorDeSerializer
from ..service import moderator as moderator_service


class ModeratorView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER]
        }
    def get(self, request, format=None):
        users = moderator_service.find_all()
        return Response(PlainUserSerializer(users, many=True).data)

    def post(self, request):
        try:
            moderator_ds = ModeratorDeSerializer(data=request.data)
            moderator_ds.is_valid(raise_exception=True)
            saved_client_user = moderator_service.insert(
                    moderator_ds.validated_data["email"],
                    moderator_ds.validated_data["password"],
                    moderator_ds.validated_data["is_active"]
                )
            return Response(PlainUserSerializer(saved_client_user).data)
        except ObjectNotFound as e :
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

class ModeratorIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, user_id, format=None):
        user = moderator_service.find_by_id(user_id)
        return Response(PlainUserSerializer(user).data)

    def post(self, request, user_id):
        try:
            moderator_ds = ModeratorDeSerializer(data=request.data)
            moderator_ds.is_valid(raise_exception=True)
            saved_user = moderator_service.update(
                    user_id,
                    moderator_ds.validated_data["email"],
                    moderator_ds.validated_data["password"],
                    moderator_ds.validated_data["is_active"]
                )
            return Response(PlainUserSerializer(saved_user).data)
        except ObjectNotFound as e :
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })


class ModeratorByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET': [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER],
        }

    def get(self, request, audit_cycle_id):
        try:
            users = moderator_service.find_by_audit_cycle(audit_cycle_id)
            print(users)
            return Response(PlainUserSerializer(users, many=True).data)
        except ObjectNotFound as e :
            raise NotFound from e

    class DeSerializer(Serializer):
        user_id = IntegerField()

    def post(self, request, audit_cycle_id):
        try:
            ds = self.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            saved_user = moderator_service.assign_audit_cycle( 
                    ds.validated_data["user_id"],
                    audit_cycle_id
                )
            return Response(PlainUserSerializer(saved_user).data)
        except ObjectNotFound as e :
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

    def delete(self, request, audit_cycle_id):
        try:
            ds = self.DeSerializer(data=request.data)
            ds.is_valid(raise_exception=True)
            saved_user = moderator_service.revoke_audit_cycle( 
                    ds.validated_data["user_id"],
                    audit_cycle_id
                )
            return Response(PlainUserSerializer(saved_user).data)
        except ObjectNotFound as e :
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })
