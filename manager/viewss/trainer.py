from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, EmailField, CharField, BooleanField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from ..serializers import PlainUserSerializer
from ..service import trainer as trainer_service


class TrainerDeSerializer(Serializer):
    email = EmailField()
    password = CharField(min_length=8, max_length=128, allow_blank=True)
    is_active = BooleanField()
    name = CharField(required=False, allow_blank=True) 
    mobile = CharField(required=False, allow_blank=True) 
    firm_name = CharField(required=False, allow_blank=True)

class TrainerView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        users = trainer_service.find_all()
        return Response(PlainUserSerializer(users, many=True).data)

    def post(self, request):
        trainer_ds = TrainerDeSerializer(data=request.data)
        trainer_ds.is_valid(raise_exception=True)
        saved_trainer_user = trainer_service.insert(
            trainer_ds.validated_data["email"],
            trainer_ds.validated_data["password"],
            trainer_ds.validated_data["is_active"],

            name=trainer_ds.validated_data.get("name"), 
            mobile=trainer_ds.validated_data.get("mobile"), 
            firm_name=trainer_ds.validated_data.get("firm_name"),
        )
        return Response(PlainUserSerializer(saved_trainer_user).data)

class TrainerIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, user_id, format=None):
        user = trainer_service.find_by_id(user_id)
        return Response(PlainUserSerializer(user).data)

    def post(self, request, user_id):
        trainer_ds = TrainerDeSerializer(data=request.data)
        trainer_ds.is_valid(raise_exception=True)
        saved_user = trainer_service.update(
            user_id,
            trainer_ds.validated_data["email"],
            trainer_ds.validated_data["password"],
            trainer_ds.validated_data["is_active"],
            
            name=trainer_ds.validated_data.get("name"),
            mobile=trainer_ds.validated_data.get("mobile"),
            firm_name=trainer_ds.validated_data.get("firm_name"),
        )
        return Response(PlainUserSerializer(saved_user).data)

