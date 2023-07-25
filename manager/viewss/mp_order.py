from rest_framework.views import APIView
from manager.models import MPOrder
from django.db.transaction import atomic
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from manager.service import mp_order_service
from registration.models import GROUP_NAME_CLIENT,GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from rest_framework.permissions import AllowAny
from manager.serializers import SolutionSerializer
from django.forms.models import model_to_dict
from django.contrib.auth.models import User

def get_order_data(data):
    order_dict = model_to_dict(data)
    return order_dict

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields=(
            'id',
            'email',
        )
        read_only_fields = fields

class OrderSerializer(ModelSerializer):
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','no_of_response','solution','user','status')
        

class MpOrderView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }
    def get(self,request):
        if request.user.id:
            order= MPOrder.objects.filter(user=request.user.id)
        else:
            order= MPOrder.objects.all()
        return Response(OrderSerializer(order,many=True).data)
    def post(self,request):
        response = mp_order_service.add_order(data=request.data)
        order_data = get_order_data(response)
        return JsonResponse(order_data)


class MpOrderStatusView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        order=MPOrder.objects.filter(status=request.GET.get('status'))
        return Response(OrderSerializer(order,many=True).data)
class MpOrderIdView(APIView):
    pass