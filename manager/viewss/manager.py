from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, EmailField, CharField, BooleanField ,NullBooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import PlainUserSerializer, ManagerAllowedCountriesSerializer
from ..service import manager as manager_service
from manager.models import ManagerProfileInfo
from django.contrib.auth.models import User
from manager.serializers import ManagerProfileSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny,IsAuthenticated



class ManagerDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    name = CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    mobile = CharField(max_length=15, required=False, allow_blank=True, allow_null=True)
    is_admin = BooleanField(required=False, default=False) 

# class ManagerprofileView(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'GET': [GROUP_NAME_MANAGER],
#         'POST': [GROUP_NAME_MANAGER]
#     }
#     def get(self, request, format=None):
#         manager_profile = ManagerProfileInfo.objects.get(user=request.user)
#         return Response(ManagerProfileSerializer(manager_profile).data)

class ManagerprofileView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }

    def get(self, request, format=None):
        manager_profile = get_object_or_404(ManagerProfileInfo, user=request.user)
        return Response(ManagerProfileSerializer(manager_profile).data)

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
    
class ManagerAllowedCountriesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self, request, user_id):
        user = manager_service.find_by_id(user_id)

        try:
            profile = ManagerProfileInfo.objects.get(user=user)
            allowed_countries = profile.allowed_countries or []
        except ManagerProfileInfo.DoesNotExist:
            allowed_countries = []

        serializer = ManagerAllowedCountriesSerializer({"user_id": user.id,"allowed_countries": allowed_countries})
        return Response(serializer.data)

    def post(self, request, user_id):
        serializer = ManagerAllowedCountriesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = manager_service.find_by_id(user_id)

        profile, _ = ManagerProfileInfo.objects.get_or_create(user=user)
        profile.allowed_countries = serializer.validated_data["allowed_countries"]
        profile.save()

        response_serializer = ManagerAllowedCountriesSerializer({"user_id": user.id,"allowed_countries": profile.allowed_countries})
        return Response(response_serializer.data)