from rest_framework.views import APIView
from client.models import MPOrder,Transaction
from django.db.transaction import atomic
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from manager.service import mp_order_service
from registration.models import GROUP_NAME_CLIENT,GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from manager.serializers import SolutionSerializer
from django.forms.models import model_to_dict
from django.contrib.auth.models import User
from manager.service import mp_order_service 
import razorpay
from django.core.files.uploadedfile import InMemoryUploadedFile
from kronos.exceptions import ObjectNotFound
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
        


class AdminOrderView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
    }
    def get(self,request):
        order = MPOrder.objects.all()
        return Response(OrderSerializer(order,many=True).data)

class MpOrderView(APIView):
    permission_classes=[IsAuthenticated]
    # required_groups={
    #     'GET':[GROUP_NAME_CLIENT],
    #     'POST':[GROUP_NAME_CLIENT]
    # }
    def extract_data(self,file):
        file_name = file.name
        file_size = file.size
        mime_type = file.content_type
        return file_name, file_size, mime_type
    
    def get(self,request):
        if request.user.id:
            order= MPOrder.objects.filter(user=request.user.id)
        return Response(OrderSerializer(order,many=True).data)
    def post(self,request):
        response = mp_order_service.add_order(data=request.data)
        order_data = get_order_data(response)
        if request.data.get('file'):
            file_name,file_size,mime_type = self.extract_data(request.data.get('file'))
            post_data,attachment = mp_order_service.order_file_upload_by_order_id(order_data.get('id'),file_name,file_size,mime_type)
        return JsonResponse(order_data)

class MpOrderIdView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }
    def extract_data(self,file):
        file_name = file.name
        file_size = file.size
        mime_type = file.content_type
        return file_name, file_size, mime_type
    
    def get_object(self,order_id):
        try:
            return MPOrder.objects.get(pk=order_id)
        except MPOrder.DoesNotExist as e:
            raise ObjectNotFound
    def get(self,request,order_id):
        result = mp_order_service.find_order_detail_by_order_id(order_id)
        return Response(result) 
    def post(self,request,order_id):
        
        order=self.get_object(order_id)
        
        response = mp_order_service.update_order(request.data,order)
        
        order_data = get_order_data(response)
        
        if request.data.get('file'):
            attachment_id = mp_order_service.find_attachment_id_by_order_id(order_id)
            mp_order_service.delete_order_file_by_attachment_id(attachment_id,order_id)            
            file_name,file_size,mime_type = self.extract_data(request.data.get('file'))
            post_data,attachment = mp_order_service.order_file_upload_by_order_id(order_id,file_name,file_size,mime_type)
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

# class MpPaymentView(APIView):
#     permission_classes=[AllowAny]
#     def post(self,request):
#         order_id = request.data.get('order_id')
#         client = razorpay.Client(auth=('rzp_live_WwU8kFv0myNlgB', 'tpOhZHWOc3LBrl2glQzlQJDP'))
#         order = get_object_or_404(MPOrder, id=order_id)
#         order_amount = int(order.price * 100)  # Amount in paise (e.g., 1000 paise = Rs. 10)
#         order_currency = 'INR'
#         order_receipt = f'order_receipt_{order.id}'
#         notes = {'note_key': 'note_value'}
#         response = client.order.create(
#             {'amount': order_amount, 'currency': order_currency, 'receipt': order_receipt, 'notes': notes}
#         )
#         order.razorpay_payment_id = response['id']
#         order.razorpay_signature = response['razorpay_signature']
#         order.save()

#         return JsonResponse(response)

    
# class MpPaymentCompleteView(APIView):
#     permission_classes=[AllowAny]
#     def post(self,request):
#         order_id = request.POST.get('order_id')
#         payment_id = request.POST.get('payment_id')
#         signature = request.POST.get('signature')
        
#         order = get_object_or_404(MPOrder, id=order_id)
#         order.razorpay_payment_id = payment_id
#         order.razorpay_signature = signature
#         order.status=MPOrder.ACTIVE
#         order.save()

#         # Save transaction data to the Transaction table
#         transaction = Transaction(order=order, payment_id=payment_id, signature=signature)
#         transaction.save()

#         return JsonResponse({'status': 'success'})    