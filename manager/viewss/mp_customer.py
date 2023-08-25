from rest_framework.views import APIView
from client.models import MPClientProfileInfo
from manager.models import MPSolution
from client.models import MPOrder
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer,IntegerField,SerializerMethodField
from rest_framework.permissions import AllowAny,IsAuthenticated
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER,OTPVerification

class OTPVerificationSerializer(ModelSerializer):
    class Meta:
        model = OTPVerification
        fields = ['is_verified']  

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'is_active',
        )
        read_only_fields = fields
        
class MPClientProfileSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = MPClientProfileInfo
        fields = ['id', 'first_name','last_name', 'mobile_number', 'user']

class MpCustomerView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        customers = MPClientProfileInfo.objects.all()
        return Response(MPClientProfileSerializer(customers,many=True).data)
class MpCountsView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        user_count = MPClientProfileInfo.objects.all().count()
        solution_count = MPSolution.objects.filter(is_active=True).all().count()
        # active_user_count =  MPClientProfileInfo.objects.filter(is_verfied=True).count()
        draft_count = MPOrder.objects.filter(status=MPOrder.DRAFT).all().count()
        active_count = MPOrder.objects.filter(status=MPOrder.ACTIVE).all().count()
        complete_count = MPOrder.objects.filter(status=MPOrder.COMPLETE).all().count()
        result={}
        result['complete_order_count']=complete_count
        result['active_order_count']=active_count
        result['draft_order_count']=draft_count
        result['solution_count']=solution_count
        result['user_count']=user_count
        return Response(result)