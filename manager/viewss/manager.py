from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, EmailField, CharField, BooleanField ,NullBooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import PlainUserSerializer
from ..service import manager as manager_service
from manager.models import ManagerProfileInfo
from django.contrib.auth.models import User



class ManagerDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    name = CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    mobile = CharField(max_length=15, required=False, allow_blank=True, allow_null=True)
    is_admin = BooleanField(required=False, default=False)
    

class ManagerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        users = manager_service.find_all()
        return Response(PlainUserSerializer(users, many=True).data)

    def post(self, request):
        manager_ds = ManagerDeSerializer(data=request.data)
        manager_ds.is_valid(raise_exception=True)

        mobile = manager_ds.validated_data.get("mobile")
        name = manager_ds.validated_data.get("name")
        

        is_admin = manager_ds.validated_data.get("is_admin", False)
        saved_manager_user = manager_service.insert(
            manager_ds.validated_data["email"],
            manager_ds.validated_data["password"],
            manager_ds.validated_data["is_active"],
        )
        user_instance = User.objects.get(id=saved_manager_user.id)
        if name is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'name': name}
            )
            if not created:
                manager_profile_info.name = name
                manager_profile_info.save()
        if mobile is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'mobile': mobile}
            )
            if not created:
                manager_profile_info.mobile = mobile
                manager_profile_info.save()

        if is_admin is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'is_admin':is_admin}
            )
            if not created:
                manager_profile_info.is_admin = is_admin
                manager_profile_info.save()

        return Response(PlainUserSerializer(saved_manager_user).data)

class ManagerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, user_id, format=None):
        user = manager_service.find_by_id(user_id)
        return Response(PlainUserSerializer(user).data)

    def post(self, request, user_id):
        manager_ds = ManagerDeSerializer(data=request.data)
        manager_ds.is_valid(raise_exception=True)
        saved_user = manager_service.update(
            user_id,
            manager_ds.validated_data["email"],
            manager_ds.validated_data["password"],
            manager_ds.validated_data["is_active"]
        )
        user_instance = User.objects.get(id=saved_user.id)
        mobile = manager_ds.validated_data.get("mobile")
        name = manager_ds.validated_data.get("name")
        is_admin = manager_ds.validated_data.get("is_admin")

        if mobile is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'mobile': mobile}
            )

            if not created:
                manager_profile_info.mobile = mobile
                manager_profile_info.save()
        if name is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'name': name}
            )

            if not created:
                manager_profile_info.name = name
                manager_profile_info.save()
        
        if is_admin is not None:
            manager_profile_info, created = ManagerProfileInfo.objects.get_or_create(
                user=user_instance,
                defaults={'is_admin':is_admin}
            )
            if not created:
                manager_profile_info.is_admin = is_admin
                manager_profile_info.save()
        return Response(PlainUserSerializer(saved_user).data)

