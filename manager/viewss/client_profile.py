from rest_framework.views import APIView
from client.models import MPClientProfileInfo
from django.contrib.auth.models import User
from rest_framework.authentication import SessionAuthentication,TokenAuthentication

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT
from rest_framework.serializers import ModelSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from kronos.exceptions import AppLogicError
class ClientProfileSerializer(ModelSerializer):
    class Meta:
        model = MPClientProfileInfo
        fields=('id','company_name','first_name','last_name','mobile_number','user_id')
        read_only_fields = fields

class ClientProfileDeSerializer(ModelSerializer):
    class Meta:
        model=MPClientProfileInfo
        fields=(
            'id',
            'first_name',
            'last_name',
            'mobile_number',
            'company_name',
            'user_id'
        )
        read_only_fields=('id','user_id')
    
    def deserialize(self):
        if self.context.get('current_user') is None:
            raise TypeError("missing keyword argument 'current_user'")
        try:
            profile_info = MPClientProfileInfo.objects.get(user_id=self.context['current_user'])
        except MPClientProfileInfo.DoesNotExist:
            profile_info=MPClientProfileInfo()
        profile_info.company_name = self.validated_data.get('company_name', profile_info.company_name)
        profile_info.first_name = self.validated_data.get('first_name', profile_info.first_name)
        profile_info.last_name = self.validated_data.get('last_name', profile_info.last_name)
        profile_info.mobile_number = self.validated_data.get('mobile_number', profile_info.mobile_number)
        
        return profile_info
    
class ClientProfileView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
    'GET': [GROUP_NAME_CLIENT],
    'POST': [GROUP_NAME_CLIENT]
    }
    def get(self,request,format=None):
        client_profile = MPClientProfileInfo.objects.get(user_id=request.session.get('user_id'))
        return Response(ClientProfileSerializer(client_profile).data)
    def post(self,request):
        profile_info_ds = ClientProfileDeSerializer(data=request.data, context={'current_user': request.session.get('user_id')})
        profile_info_ds.is_valid(raise_exception=True)
        profile_info = profile_info_ds.deserialize()
        profile_info.save()
        return Response(ClientProfileSerializer(profile_info).data)