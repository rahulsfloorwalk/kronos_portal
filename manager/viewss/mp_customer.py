from rest_framework.views import APIView
from client.models import MPClientProfileInfo
from manager.models import MPSolution,MPOrder
from rest_framework.response import Response
from django.http import JsonResponse
from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER,OTPVerification
class MpCustomerView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        customer = MPClientProfileInfo.objects.all()
        result=[]
        if customer:
            for i in customer:
                verified=OTPVerification.objects.get(user_id=i.user_id)
                data={'id':i.id,'user_id':i.user.id,'full_name': i.first_name+' '+i.last_name,'phone':i.mobile_number,'email':i.user.email,'is_verified':verified.is_verified}
                result.append(data)
        return Response(result)
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