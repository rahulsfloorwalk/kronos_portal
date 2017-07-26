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

from ..serializers import ClientUserSerializer, ClientUserDeSerializer
from client.service import client_user as client_user_service

from client.models import Client, ClientUser


class ClientUserByClientView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, client_id, format=None):
        try:
            client_users = Client.objects.get(pk=client_id).users
            return Response(ClientUserSerializer(client_users, many=True).data)
        except Client.DoesNotExist:
            raise NotFound

class ClientUserView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'POST': [GROUP_NAME_MANAGER]
        }
    def post(self, request):
        try:
            client_user_ds = ClientUserDeSerializer(data=request.data)
            client_user_ds.is_valid(raise_exception=True)
            saved_client_user = client_user_service.insert(
                    client_user_ds.validated_data["client"],
                    client_user_ds.validated_data["full_name"],
                    client_user_ds.validated_data["email"],
                    client_user_ds.validated_data["is_client_admin"],
                    client_user_ds.validated_data["password"],
                    client_user_ds.validated_data["is_active"]
                )
            return Response(ClientUserSerializer(saved_client_user).data)
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })
        except ObjectNotFound as e :
            raise NotFound from e

class ClientUserIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, client_user_id, format=None):
        try:
            client_user = ClientUser.objects.get(id=client_user_id)
            return Response(ClientUserSerializer(client_user).data)
        except ClientUser.DoesNotExist:
            raise NotFound

    def post(self, request, client_user_id):
        try:
            client_user_ds = ClientUserDeSerializer(data=request.data)
            client_user_ds.is_valid(raise_exception=True)
            saved_client_user = client_user_service.update(
                    client_user_id,
                    client_user_ds.validated_data["client"],
                    client_user_ds.validated_data["full_name"],
                    client_user_ds.validated_data["email"],
                    client_user_ds.validated_data["is_client_admin"],
                    client_user_ds.validated_data["password"],
                    client_user_ds.validated_data["is_active"]
                )
            return Response(ClientUserSerializer(saved_client_user).data)
        except ObjectNotFound as e :
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                'non_field_errors': [e.__str__()]
            })

    def delete(self, request, client_user_id):
        try:
            client_user = ClientUser.objects.get(id=client_user_id)
            client_user.delete()
            return Response(None)
        except ClientUser.DoesNotExist:
            raise NotFound
