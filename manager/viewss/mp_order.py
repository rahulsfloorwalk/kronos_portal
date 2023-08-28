from rest_framework.views import APIView
from client.models import MPOrder,Transaction,MPClientProfileInfo,Client
from django.db.transaction import atomic
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from manager.service import mp_order_service
from registration.models import GROUP_NAME_CLIENT,GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import SolutionSerializer
from django.forms.models import model_to_dict
from django.contrib.auth.models import User
from manager.service import mp_order_service 
import razorpay
from kronos.exceptions import ObjectNotFound
from datetime import datetime, timedelta
from django.utils.text import slugify
from audit.service import audit_cycle as audit_cycle_service
from client.models import Client
from manager.models import MPSolutionOtherDetails,MPSolutionQuestion,MPSolutionProofTagList,MPSolution
from django.utils import timezone
from audit.models import AuditCycle
from rest_framework.serializers import Serializer, CharField, ModelSerializer, IntegerField
from manager.viewss.section import SectionDeSerializer,SectionSerializer
from questionnaire.service import section as section_service
from manager.viewss.question import QuestionDeSerializer
from questionnaire.service import question as question_service
from manager.models import ProofTag
from audit.models.proof_tag import AuditCycleProofTagList
from audit.service import audit_service
from ..serializers import AuditSerializer
from kronos.exceptions import ObjectNotFound, AppLogicError
from rest_framework import serializers


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

class AdminOrderSerializer(ModelSerializer):
    user_email = serializers.CharField(source='user.email')
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','user_email','no_of_response','solution','user','status')
       
class AdminOrderView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
    }
    def get(self, request):
        status = request.GET.get('status')
        if status == 'ALL':
            orders = MPOrder.objects.all()
        else:
            orders = MPOrder.objects.filter(status=status)
        return Response(OrderSerializer(orders, many=True).data)
    
class ClientOrderStatusDeatil(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
    }
    
    def get(self,request):
        user=request.user
        client = Client.objects.get(email=user.email)
        status = request.GET.get('status')
        if status == 'ALL':
            orders = MPOrder.objects.filter(user=user).all()
        else:
            orders = MPOrder.objects.filter(user=user,status=status)
        return Response(OrderSerializer(orders,many=True).data)

class MpOrderView(APIView):
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
    
    def get(self,request):
        if request.user.id:
            order= MPOrder.objects.filter(user=request.user.id)
        return Response(OrderSerializer(order,many=True).data)
    def post(self,request):
        response = mp_order_service.add_order(data=request.data,user_id=request.user.id)
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

class MpPaymentView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }
    def post(self,request):
        order_id = request.data.get('mp_order_id')
        client = razorpay.Client(auth=('rzp_test_5ws7pWCryHQLI3', 'WHigTD04Xt2JsFPSpgbrj8My'))
        order = get_object_or_404(MPOrder, id=order_id)
        order_amount = int(order.price * 100)  # Amount in paise (e.g., 1000 paise = Rs. 10)
        order_currency = 'INR'
        order_receipt = f'order_receipt_{order.id}'
        notes = {'note_key': 'note_value'}
        response = client.order.create(
            {'amount': order_amount, 'currency': order_currency, 'receipt': order_receipt, 'notes': notes}
        )

        order.razorpay_payment_id = response['id']
        order.save()

        return JsonResponse(response)
    
class MpPaymentCompleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }
   
    def post(self,request):
        order_id = request.data.get('order_id')
        payment_id = request.data.get('payment_id')
        signature = request.data.get('signature')
        mp_order_id = request.data.get('mp_order_id')  

        try:
            order = MPOrder.objects.get(id=mp_order_id)
            if order.status == MPOrder.DRAFT:
                order.razorpay_payment_id = payment_id
                order.razorpay_signature = signature
                order.status='ACTIVE'
                order.save()
            else:
                return JsonResponse({'error': 'Order exists but status is not DRAFT'})
        except MPOrder.DoesNotExist:
            order = MPOrder.objects.create(
                id=order_id,
                razorpay_payment_id=payment_id,
                razorpay_signature=signature,
                status='ACTIVE'
            )
      
        transaction = Transaction(order=order, payment_id=payment_id, signature=signature)
        transaction.payment_success_date = timezone.now()
        transaction.save()
        
        user=User.objects.get(id=request.user.id)
        client = Client.objects.get(email=user.email)
        solution_details= MPSolutionOtherDetails.objects.get(solution=order.solution)

        audit_cycle_response = create_audit_cycle(client, order, solution_details,transaction)

        add_section = Add_Section(audit_cycle_response)

        mpsolutionquestions = MPSolutionQuestion.objects.filter(solution=order.solution)
        for mpsolutionquestion in mpsolutionquestions:
            add_question = Add_Question(mpsolutionquestion, add_section)

        mpsolutionprooftags = MPSolutionProofTagList.objects.filter(solution=order.solution)
        for mpsolutionprooftag in mpsolutionprooftags:
            add_proof_tag_list(mpsolutionprooftag.proof_tag_id,audit_cycle_response)

        add_store_response = add_store_to_audit(audit_cycle_response,order,solution_details)
        
        return JsonResponse({'status': 'success'})       

def add_proof_tag_list(proof_tag_id,audit_cycle):
    proof_tag_obj = ProofTag.objects.get(pk=proof_tag_id)
    audit_cycle_proof_tag_obj = AuditCycleProofTagList()
    audit_cycle_proof_tag_obj.audit_cycle = audit_cycle
    audit_cycle_proof_tag_obj.proof_tag = proof_tag_obj
    audit_cycle_proof_tag_obj.save()

def create_audit_cycle(client, order, solution_details,transaction):
        current_date = datetime.now()
        base_name = f"{(client.name)} {current_date.strftime('%b %Y')}"
        name = base_name
        counter = 1
        while AuditCycle.objects.filter(name=name).exists():
            name = f"{base_name} ({counter})"
            counter += 1

        start_date = transaction.payment_success_date.date()
        end_date = start_date + timedelta(days=10)

        audit_cycle_data = {
            'name': name,
            'status': 'ACTIVE',
            'start_date': start_date,
            'end_date': end_date,
            'reimbursement': 0,
            'audit_auto_approve': True,
            'type' : solution_details.solution.audit_type,
            'earnings_per_audit': solution_details.audit_fee,
            'description': solution_details.description,
            'check_points' : solution_details.check_points,
            'post_approval_description' : solution_details.post_approval_description,
            'client': client.id,
            'planned_audit': order.no_of_response,
            'audit_alignment_factors':order.alignment_factors,
        }
        
        audit_cycle_ds = MPAuditCycleDeSerializer(data=audit_cycle_data)
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        serialized_audit_cycle = MPAuditCycleDeSerializer(saved_audit_cycle).data  

        return (saved_audit_cycle)

class MPAuditCycleDeSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'type',
            'status',
            'start_date',
            'end_date',
            'planned_audit',
            'earnings_per_audit',
            'reimbursement',
            'description',
            'client',
            'questionnaire_type',
            'audit_auto_approve',
            'check_points',
            'post_approval_description',
            'audit_alignment_factors'
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            audit_cycle = AuditCycle.objects.get(id=self.context.get('id'))
        else:
            audit_cycle = AuditCycle()
        audit_cycle.name = self.validated_data.get('name', audit_cycle.name)
        audit_cycle.type = self.validated_data.get('type', audit_cycle.type)
        audit_cycle.status = self.validated_data.get('status', audit_cycle.status)
        audit_cycle.start_date = self.validated_data.get('start_date', audit_cycle.start_date)
        audit_cycle.end_date = self.validated_data.get('end_date', audit_cycle.end_date)
        audit_cycle.planned_audit = self.validated_data.get('planned_audit', audit_cycle.planned_audit)
        audit_cycle.earnings_per_audit = self.validated_data.get('earnings_per_audit', audit_cycle.earnings_per_audit)
        audit_cycle.reimbursement = self.validated_data.get('reimbursement', audit_cycle.reimbursement)
        audit_cycle.description = self.validated_data.get('description', audit_cycle.description)
        audit_cycle.audit_auto_approve = self.validated_data.get('audit_auto_approve', audit_cycle.audit_auto_approve)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        audit_cycle.post_approval_description = self.validated_data.get('post_approval_description', audit_cycle.post_approval_description)
        audit_cycle.check_points = self.validated_data.get('check_points', audit_cycle.check_points)
        audit_cycle.audit_alignment_factors = self.validated_data.get('audit_alignment_factors', audit_cycle.audit_alignment_factors)

        return audit_cycle

def Add_Section(audit_cycle_response):
    data = {
        'name' : 'Audit sequence',
        'audit_cycle' : audit_cycle_response.id,
        'sequence' : 1,
        'minimum_attachment_count' : 0,
        'hide_comment' : False,
    }

    section_ds = SectionDeSerializer(data=data)
    section_ds.is_valid(raise_exception=True)
    section = section_ds.deserialize()
    savedSection = section_service.save(section)
    return (section)

def Add_Question(mpsolutionquestion,add_section):
    data = {
        'id' : mpsolutionquestion.id,
        'sequence' : mpsolutionquestion.sequence,
        'question_txt' : mpsolutionquestion.question_txt,
        'max_marks' : mpsolutionquestion.max_marks,
        'solution' : mpsolutionquestion.solution,
        'question_type' : mpsolutionquestion.question_type,
        'question_data' : mpsolutionquestion.question_data,
        'hide_question' : mpsolutionquestion.hide_question,
        'optional_comment_required' : mpsolutionquestion.optional_comment_required,
        'section' : add_section.id,
    }

    q_ds= QuestionDeSerializer(data=data)
    q_ds.is_valid(raise_exception=True)
    question = q_ds.deserialize()
    saved_question = question_service.save(question)
    return question

def add_store_to_audit(audit_cycle,order,solution_details):
        if order.store and isinstance(order.store, list) and len(order.store) > 0:
            audit_responses = [] 
            for store_data in order.store:
                store_id = store_data['store_id']
                count = store_data['count']
                data = {
                    'audit_cycle':audit_cycle.id,
                    'addStore':[store_id],
                    'earnings_per_audit':audit_cycle.earnings_per_audit,
                    'reimbursement':audit_cycle.reimbursement,
                    'count': count,
                    'post_approval_description':solution_details.post_approval_description
                }
                audit = audit_service.create_audit_by_multiple_store(data)
                audit_responses.append(audit[0] if audit else None)
            return Response([AuditSerializer(audit).data for audit in audit_responses])
        else:
            raise AppLogicError("Please provide a valid store ID")
