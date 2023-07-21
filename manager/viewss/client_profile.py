from rest_framework.views import APIView
from client.models import MPClientProfileInfo
from django.contrib.auth.models import User
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
        profile_info.user_id = self.context['current_user']
        profile_info.company_name = self.validated_data.get('company_name', profile_info.company_name)
        profile_info.first_name = self.validated_data.get('first_name', profile_info.first_name)
        profile_info.last_name = self.validated_data.get('last_name', profile_info.last_name)
        profile_info.mobile_number = self.validated_data.get('mobile_number', profile_info.mobile_number)
        
        return profile_info
    
class ClientProfileView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
    'GET': [GROUP_NAME_CLIENT],
    'POST': [GROUP_NAME_CLIENT]
    }
    def get(self,request,user_id,format=None):
        user = User.objects.get(id=user_id).groups.add(name=GROUP_NAME_CLIENT) 
        if not user:
            raise AppLogicError('User is not Valid')
        client_profile=MPClientProfileInfo.objects.get(user_id=user.id)
        return Response(ClientProfileSerializer(client_profile).data)
    def post(self,request,user_id):
        user = User.objects.get(id=user_id).groups.add(name=GROUP_NAME_CLIENT) 
        if not user:
            raise AppLogicError('User is not Valid')
        profile_info_ds = ClientProfileDeSerializer(data=request.data, context={'current_user': user.id})
        profile_info_ds.is_valid(raise_exception=True)
        profile_info = profile_info_ds.deserialize()
        profile_info.save()
        return Response(ClientProfileSerializer(profile_info).data)