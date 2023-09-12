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
from client.models import Client,Store
from manager.models import MPSolutionOtherDetails,MPSolutionQuestion,MPSolutionProofTagList,MPSolution,City,MPSolutionCategoryDetails
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
from manager.serializers import AuditCycleSerializer,StoreSerializer,CitySerializer
from client.service import store as store_service
from questionnaire.models import QuestionnaireType
from manager.viewss.questionnaire_type import QuestionnaireTypeSerializer
from client_report.service import audit_section
from answer.models import Answer,Question
from audit_store.models import AuditStore
from audit.models.audit import Audit
from questionnaire.models.section import Section
from answer.service import answer as answer_service
from manager.viewss.answer import AnswerSerializer
from manager.viewss.client_profile import ClientProfileSerializer



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
        fields=('id','no_of_response','solution','user','status','category')

class AdminOrderSerializer(ModelSerializer):
    user_email = serializers.CharField(source='user.email')
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','user_email','no_of_response','solution','user','status','category')
       
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
        file_name = file.file_name
        file_size = file.file_size
        mime_type = file.file_type
        return file_name, file_size, mime_type
    
    def get(self,request):
        if request.user.id:
            order= MPOrder.objects.filter(user=request.user.id)
        return Response(OrderSerializer(order,many=True).data)
    def post(self,request):
        response = mp_order_service.add_order(data=request.data,user_id=request.user.id)
        order_data = get_order_data(response)
        if request.data.get('file'):
            # print("test",request.data.get('file').file_type,request.data.get('file').file_name,request.data.get('file').file_size)
            # file_name,file_size,mime_type = self.extract_data(request.data.get('file'))
            post_data,attachment = mp_order_service.order_file_upload_by_order_id(order_data.get('id'),request.data.get('file').get("file_name"),request.data.get('file').get("file_size"),request.data.get('file').get("file_type"))
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

        tax_rate = order.solution.tax.rate
        tax_amount = (tax_rate/100)*order.price
        order_amount = int((order.price + tax_amount) *100)  # Amount in paise (e.g., 1000 paise = Rs. 10)
        order_currency = 'INR'
        order_id=order.id
        order_receipt = 'order_receipt_{}'.format(order_id)
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
        razor_order_id = request.data.get('order_id')
        payment_id = request.data.get('payment_id')
        signature = request.data.get('signature')
        order_id = request.data.get('mp_order_id')  

        try:
            order = MPOrder.objects.get(id=order_id)            
            if order.status == MPOrder.DRAFT:
                order.razorpay_payment_id = payment_id
                order.razorpay_signature = signature
                order.status='ACTIVE'
                order.save()
            else:
                return JsonResponse({'error': 'Order exists but status is not DRAFT'})
        except MPOrder.DoesNotExist:
            order = MPOrder.objects.create(
                id=razor_order_id,
                razorpay_payment_id=payment_id,
                razorpay_signature=signature,
                status='ACTIVE'
            )

        transaction = Transaction(order=order, payment_id=payment_id, signature=signature)
        transaction.payment_success_date = timezone.now()
        transaction.save()
        
        user=User.objects.get(id=request.user.id)
        client = Client.objects.get(email=user.email)
        client.is_active = True
        client.save()
        solution_details= MPSolutionOtherDetails.objects.get(solution=order.solution)

        questionnaire_data = {
            'name': solution_details.solution.audit_type,
            'client': client.id
        }
        add_questionnaire_type_id = create_questionnaire_type(questionnaire_data)

        audit_cycle_response = create_audit_cycle(client, order, solution_details,transaction,add_questionnaire_type_id)


        add_section = Add_Section(audit_cycle_response)

        mpsolutionquestions = MPSolutionQuestion.objects.filter(solution=order.solution)
        for mpsolutionquestion in mpsolutionquestions:
            add_question = Add_Question(mpsolutionquestion, add_section)

        mpsolutionprooftags = MPSolutionProofTagList.objects.filter(solution=order.solution)
        for mpsolutionprooftag in mpsolutionprooftags:
            add_proof_tag_list(mpsolutionprooftag.proof_tag_id,audit_cycle_response)

        add_store_response = add_store_to_audit(audit_cycle_response,order,solution_details)
        
        return JsonResponse({'status': 'success'})       

def create_questionnaire_type(questionnaire_data):
        questionnaire_name = questionnaire_data['name']
        client_id = questionnaire_data['client']
        existing_questionnaire_type = QuestionnaireType.objects.filter(name=questionnaire_name,client=client_id).first()

        if existing_questionnaire_type:
            return (existing_questionnaire_type.id)
        
        add_questionnaire_type = QuestionnaireTypeSerializer(data=questionnaire_data)
        add_questionnaire_type.is_valid(raise_exception=True)
        add_questionnaire_type.save()
        
        return (add_questionnaire_type.instance.id)
    

def add_proof_tag_list(proof_tag_id,audit_cycle):
    proof_tag_obj = ProofTag.objects.get(pk=proof_tag_id)
    audit_cycle_proof_tag_obj = AuditCycleProofTagList()
    audit_cycle_proof_tag_obj.audit_cycle = audit_cycle
    audit_cycle_proof_tag_obj.proof_tag = proof_tag_obj
    audit_cycle_proof_tag_obj.save()

def create_audit_cycle(client, order, solution_details,transaction,add_questionnaire_type_id):
        # orderss = MPOrder.objects.get(id=order_id)
        solution_name = solution_details.solution.name
        formatted_date = datetime.now().strftime('%b %Y')
        result = "{} {}".format(solution_name,formatted_date)
        # base_name = f"{(solution_details.solution.name)} {current_date.strftime('%b %Y')}"
        name = result
        counter = 1
        while AuditCycle.objects.filter(name=name).exists():
            name = "{} ({})".format(result,counter)
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
            'order': order.id,
            'audit_alignment_factors':order.alignment_factors,
            'questionnaire_type':add_questionnaire_type_id,
            'charge_per_audit':solution_details.solution.price
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
            'audit_alignment_factors',
            'questionnaire_type',
            'order',
            'charge_per_audit'
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
        audit_cycle.order = self.validated_data.get('order', audit_cycle.order)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        audit_cycle.post_approval_description = self.validated_data.get('post_approval_description', audit_cycle.post_approval_description)
        audit_cycle.check_points = self.validated_data.get('check_points', audit_cycle.check_points)
        audit_cycle.charge_per_audit = self.validated_data.get('charge_per_audit', audit_cycle.charge_per_audit)
        audit_cycle.audit_alignment_factors = self.validated_data.get('audit_alignment_factors', audit_cycle.audit_alignment_factors)

        return audit_cycle

def Add_Section(audit_cycle_response):
    data = {
        'name' : 'Audit Details',
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
                if count >= 1:
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


class AuditCycleViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, client_id, format=None):
        user = request.user
        client = Client.objects.get(email=user.email)
        audit_cycles = audit_cycle_service.find_audit_cycles_by_client(client_id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)
    

class OrderReportsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)

        status_param = request.query_params.get('status')
        status_mapping = {
            'DRAFT': 'DRAFT',
            'COMPLETE': 'COMPLETE',
            'ACTIVE': 'ACTIVE',
        }
        
        if status_param and status_param in status_mapping:
            status_value = status_mapping[status_param]
            if status_value == 'DRAFT':
                mp_order = MPOrder.objects.filter(user=request.user, status=status_value)
                if mp_order:
                    mp_order_data = []
                    for mp_order in mp_order:            
                        mp_order_data.append({
                            'mp_order': MPOrderSerializer(mp_order).data,
                        })
                    return Response({'mp_order_data': mp_order_data})
                else:
                    return Response({'message': 'No DRAFT status MPOrder found for this client.'})
            else:
                audit_cycles = AuditCycle.objects.filter(client=client.id, status=status_value)
        else:
            default_statuses = ['COMPLETE', 'ACTIVE']
            audit_cycles = AuditCycle.objects.filter(client=client.id, status__in=default_statuses)

        audit_cycle_data = []

        product_name = request.query_params.get('product_name')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if product_name:
            audit_cycles = audit_cycles.filter(order_id__solution__name__icontains=product_name)
        if start_date_str:
                audit_cycles = audit_cycles.filter(start_date=start_date_str)                
        if end_date_str:
                audit_cycles = audit_cycles.filter(end_date=end_date_str)

        for audit_cycle in audit_cycles:
            audit_score_response = audit_cycle.get_total_percentage()
           
            if audit_cycle.order is not None:
                order = MPOrder.objects.get(id=audit_cycle.order.id)
                store_info = order.store
                store_count = len(store_info) if store_info else 0
                audit_cycle_data.append({
                    'id': audit_cycle.id,
                    'audit_cycle': AuditCycleSerializer(audit_cycle).data,
                    'order': MPOrderSerializer(order).data,
                    'audit_score': audit_score_response,
                    'store_info': store_info,
                    'store_count': store_count,
                })
        if audit_cycle_data:
            return Response({'audit_cycle_data': audit_cycle_data})
        else:
            return JsonResponse({'error': 'No audit cycles found for this client.'})
            

class OrderReportListView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    
    def get(self, request,audit_cycle_id):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        audit_cycle = AuditCycle.objects.get(id=audit_cycle_id) 
        order = MPOrder.objects.get(id=audit_cycle.order.id)

        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        solution_details= MPSolutionOtherDetails.objects.get(solution=order.solution)

        store_data = report_store_to_audit(audit_cycle,order,solution_details)
        report_data = []
        report_data.append({
                    # 'audit_cycle': CustomAuditCycleSerializer(audit_cycle).data,
                    # 'order': MPOrderSerializer(order).data,
                    'store_data':store_data,
                    'audit_stores' : audit_stores,
                })
        if report_data:
            return Response({'audit_cycle_data': report_data})
        else:
            return JsonResponse({'error': 'No audit cycles found for this client.'})
        
def report_store_to_audit(audit_cycle, order, solution_details):
    if order.store and isinstance(order.store, list):
        store_responses = [] 
        audit_cycle = AuditCycle.objects.get(id=audit_cycle.id)
        order = MPOrder.objects.get(id=order.id)

        for store_data in order.store:
            store_id = store_data['store_id']
            count = store_data['count']

            stores = Store.objects.get(id=store_id)
            store_data = StoreDeSerializer(stores).data 

            data = {
                'id': stores.id,
                'store_data': store_data,
                'audit_cycle': CustomAuditCycleSerializer(audit_cycle).data,
                'order': MPOrderRepotsSerializer(order).data,
            }
            store_responses.append(data)
        
        return (store_responses)
    else:
        raise AppLogicError("Please provide a valid store ID")
    
def get(self, request, audit_cycle_id, format=None):
        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        return Response(audit_stores)

class StoreDeSerializer(ModelSerializer):
    city = CitySerializer()
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'pincode',
            'city',
        )
        read_only_fields = ('id',)

    def get_city(self, obj):
        city = obj.city
        return CitySerializer(city).data
    
class MPOrderSerializer(ModelSerializer):
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','solution','category','user','price','no_of_response','describe','status','alignment_factors','store')
    
class MPOrderRepotsSerializer(ModelSerializer):
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','solution','user','price','no_of_response','describe','status',)
    
class CustomAuditCycleSerializer(ModelSerializer):
    questionnaire_type = QuestionnaireTypeSerializer()
    # store_data = serializers.SerializerMethodField()
    class Meta:
        model=AuditCycle
        fields=('id','name','start_date','end_date','planned_audit','earnings_per_audit','reimbursement','charge_per_audit','description','questionnaire_type')

    def get_store_data(self, obj):
        return obj.store_data

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__' 


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'


class MPOrderReportListDetailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request,audit_cycle_id):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        audit_cycle = AuditCycle.objects.get(id=audit_cycle_id) 
        order = MPOrder.objects.get(id=audit_cycle.order.id)

        audit_stores = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, request.user.id)
        
        report_data = []

        for audit_store in audit_stores:
            answers = answer_service.find_by_audit_store(audit_store['audit_store_id'])
            answer_data = AnswerSerializer(answers, many=True).data
            report_data.append({
                'audit_cycle_name': audit_cycle.name,
                'order': MPOrderRepotsSerializer(order).data,
                'audit_stores': audit_store,
                'answers': answer_data
            })
        if report_data:
            return Response({'store_audit_data': report_data})
        else:
            return JsonResponse({'error': 'No repots found for this audit.'})

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer() 
    class Meta:
        model = Answer
        fields = '__all__'

class OrderInvoicesView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request,audit_cycle_id):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        client_profile = MPClientProfileInfo.objects.get(user=user.id)
        audit_cycle = AuditCycle.objects.get(id=audit_cycle_id) 
        order = MPOrder.objects.get(id=audit_cycle.order.id)

        if client_profile.user == order.user and (order.status == 'ACTIVE' or order.status == 'COMPLETE'):
            transaction = Transaction.objects.get(order_id=order.id)
            invoice_data = ({
                    'client_profile_data' : ClientProfileSerializer(client_profile).data,
                    'order': MPOrderRepotsSerializer(order).data,
                    'transaction': TransactionSerializer(transaction).data,
                })
            if invoice_data:
                return Response({'invoice_data': invoice_data})
            else:
                return JsonResponse({'error': 'No payment for any audit cycles.'})
        else :
            return JsonResponse({'error': 'No payment for any audit cycles.'})


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields=('id','payment_success_date')

        