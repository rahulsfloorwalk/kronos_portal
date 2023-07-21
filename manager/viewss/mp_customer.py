from rest_framework.views import APIView
from client.models import MPClientProfileInfo
from rest_framework.response import Response
from django.http import JsonResponse
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER

def profile_info():
    customer = MPClientProfileInfo.objects.all()
    result=[]
    for i in customer:
        result.append({'full_name':i.first_name+' '+i.last_name,'phone':i.mobile_number,'email':i.user.email})
    return result
class MpCustomerView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        result = profile_info()
        return Response(result)