from rest_framework.response import Response
from rest_framework.views import APIView
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_AUDITOR
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.serializers import Serializer, CharField
from .service import auditor_api as auditor_service_api

class ChangePasswordDeSerializer(Serializer):
    old_password = CharField(min_length=8, max_length=128)
    new_password = CharField(min_length=8, max_length=128)


class ChangePasswordView(APIView):
    permission_classes = [HasGroupPermission]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    required_groups = {
        'POST': [GROUP_NAME_AUDITOR]
    }

    def post(self, request):
        ds = ChangePasswordDeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        response = auditor_service_api.change_password(
            request.user.id,
            ds.validated_data['old_password'],
            ds.validated_data['new_password']
        )
        return Response(response)
