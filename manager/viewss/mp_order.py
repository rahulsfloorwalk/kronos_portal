from rest_framework.views import APIView
from client.models import MPOrder,Transaction,MPClientProfileInfo,Client,MPCategory
from django.db.transaction import atomic
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from registration.models import GROUP_NAME_CLIENT,GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import SolutionSerializer
from django.forms.models import model_to_dict
from django.contrib.auth.models import User
from manager.service import mp_order_service 
import razorpay
from questionnaire.service import section_proof_tag
from kronos.exceptions import ObjectNotFound
from datetime import datetime, timedelta
from django.utils.text import slugify
from audit.service import audit_cycle as audit_cycle_service
from client.models import Client,Store
from manager.models import MPSolutionOtherDetails,MPSolutionQuestion,MPSolutionProofTagList,MPSolution,City
from django.utils import timezone
from audit.models import AuditCycle
from rest_framework.serializers import Serializer, CharField, ModelSerializer
from manager.viewss.section import SectionDeSerializer
from questionnaire.service import section as section_service
from manager.viewss.question import QuestionDeSerializer
from questionnaire.service import question as question_service
from audit.service import audit_service
from ..serializers import AuditSerializer
from kronos.exceptions import ObjectNotFound, AppLogicError
from rest_framework import serializers
from manager.serializers import AuditCycleSerializer,StoreSerializer,CitySerializer
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
from manager.serializers import AuditStoreSerializerWithoutAudit
from manager.serializers import AttachmentSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000

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
        fields=('id','no_of_response','solution','user','status','category','created_at','modified_at')

class AdminOrderSerializer(ModelSerializer):
    user_email = serializers.CharField(source='user.email')
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','user_email','no_of_response','solution','user','status','category','created_at','modified_at')
       
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
        draft_count = MPOrder.objects.filter(user=user,status=MPOrder.DRAFT).all().count()
        active_count = MPOrder.objects.filter(user=user,status=MPOrder.ACTIVE).all().count()
        complete_count = MPOrder.objects.filter(user=user,status=MPOrder.COMPLETE).all().count()
        result={}
        result['complete_order_count']=complete_count
        result['active_order_count']=active_count
        result['draft_order_count']=draft_count
        return Response(result)

class MpOrderView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }
    
    def get(self,request):
        if request.user.id:
            order= MPOrder.objects.filter(user=request.user.id)
        return Response(OrderSerializer(order,many=True).data)
    def post(self,request):
        response = mp_order_service.add_order(data=request.data,user_id=request.user.id)
        order_data = get_order_data(response)
        return JsonResponse(order_data)

class MpOrderIdView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_CLIENT],
        'POST':[GROUP_NAME_CLIENT]
    }   

   
    def get_object(self,order_id):
        try:
            return MPOrder.objects.get(pk=order_id)
        except MPOrder.DoesNotExist as e:
            raise ObjectNotFound
    def get(self,request,order_id):
        result = mp_order_service.find_order_detail_by_order_id(order_id)
        order_instance = self.get_object(order_id)
        mp_order_data = MPOrderSerializer(order_instance).data
        # mp_order_data =  MPOrderSerializer().data
        return Response(mp_order_data)

    def post(self,request,order_id):
        
        order=self.get_object(order_id)
        response = mp_order_service.update_order(request.data,order)
        order_data = get_order_data(response)
        return JsonResponse(order_data)
    
class MpOrderAttachmentView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups ={
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }
    def get(self,request,order_id):
        attachments = mp_order_service.find_attachment_id_by_order_id(order_id)
        # return Response(AttachmentSerializer(attachment).data)
        if attachments.exists():
            attachment = attachments.first()
            return Response(AttachmentSerializer(attachment).data)
        else:
            return Response([])
    
    def post(self,request,order_id):
        try:
            post_data, attachment = mp_order_service.order_file_upload_by_order_id(               
                order_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
        
class MpOrderDeleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_CLIENT],
    }
    def delete(self,request,attachment_id):
        mp_order_service.delete_order_file_by_attachment_id(attachment_id,request.data)
        return Response()
    
class MpOrderAttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT],
    }
    def post(self, request, attachment_id):
        attachment = mp_order_service.complete_for_order(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)

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

    def extract_data(self,file):
        file_name = file.file_name
        file_size = file.file_size
        mime_type = file.file_type
        return file_name, file_size, mime_type
    
    def post(self, request):
        try:
            order_id = request.data.get('mp_order_id')
            attachments = request.FILES.get('file')
            client = razorpay.Client(auth=('rzp_live_7n6ULYH6VDbGb9', 'WV27rxb1UuffQbBU6xNoPMVv'))
            order = get_object_or_404(MPOrder, id=order_id)

            tax_rate = order.solution.tax.rate
            tax_amount = (tax_rate / 100) * order.price
            order_amount = int((order.price + tax_amount) * 100)
            order_currency = 'INR'
            order_id = order.id
            order_receipt = 'order_receipt_{}'.format(order_id)
            notes = {'note_key': 'note_value'}
            response = client.order.create({
                'amount': order_amount,
                'currency': order_currency,
                'receipt': order_receipt,
                'notes': notes
            })

            order.razorpay_payment_id = response['id']
            try:
                solution = MPSolution.objects.get(id=request.data['solution'])
            except MPSolution.DoesNotExist as e:
                raise ObjectNotFound from e
            try:
                category = MPCategory.objects.get(id=request.data['category'])
            except MPCategory.DoesNotExist as e:
                raise ObjectNotFound from e

            sum = 0
            if request.data.get('store'):
                for i in request.data.get('store'):
                    sum += i['count']
            order.no_of_response = request.data.get('no_of_response')
            order.describe = request.data.get('describe')
            order.solution = solution
            order.category = category
            order.status = request.data.get('status')
            solution_price = int(solution.price)
            no_of_response = int(request.data.get('no_of_response'))

            order.price = solution_price * no_of_response

            store = []
            if request.data.get('store'):
                for i in request.data['store']:
                    store.append(i)
                order.store = store
            order.save()
            if attachments:
                post_data, attachment = mp_order_service.order_file_upload_by_order_id(
                    order_id, request.data.get('file').get("file_name"),
                    request.data.get('file').get("file_size"),
                    request.data.get('file').get("file_type")
                )
        except Exception as e:
            order.payment_status = MPOrder.PAYMENT_FAILED
            order.save()
            return JsonResponse({'error': 'Payment initiation failed'}, status=500)

        return JsonResponse(response)
    
class MpPaymentCompleteView(APIView):
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
                if payment_is_successful(payment_id, signature):
                    order.status = MPOrder.ACTIVE
                    order.payment_status = MPOrder.PAYMENT_SUCCESS
                    order.save()
                else:
                    order.payment_status = MPOrder.PAYMENT_FAILED
                    order.save()
                    return JsonResponse({'error': 'Payment failed for some reason'})
            else:
                return JsonResponse({'error': 'Order exists but status is not DRAFT'})
        except MPOrder.DoesNotExist:
            return JsonResponse({'error': 'Order exists but status is not DRAFT.'}, status=404)

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
        proof_tag_list=[]
        for mpsolutionprooftag in mpsolutionprooftags:
            proof_tag_list.append({'id':mpsolutionprooftag.proof_tag.id,'name':mpsolutionprooftag.proof_tag.name,'is_present_in_section':True,'is_required':True,'max_attachment_count':2})
        if proof_tag_list:
            section_proof_tag.save_section_proof_tag(add_section.id,audit_cycle_response.id,proof_tag_list)

        add_store_response = add_store_to_audit(audit_cycle_response,order,solution_details)
        
        return JsonResponse({'status': 'success'})   

def payment_is_successful(payment_id, signature):    
    if payment_id and signature:
        return True
    else:
        return False

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
    

def get_last_audit_cycle_number(client):
    last_audit_cycle = AuditCycle.objects.filter(client=client).order_by('-id').first()

    if last_audit_cycle:
        my_list = last_audit_cycle.name.split(' ')
        
        if my_list[-1].startswith('(') and my_list[-1].endswith(')'):
            my_list[-1] = my_list[-1][1:-1]
        last_number = my_list[3]
        return last_number
    else:
        return 0
def create_audit_cycle(client, order, solution_details,transaction,add_questionnaire_type_id):
        last_audit_cycle_number = get_last_audit_cycle_number(client)
        new_audit_cycle_number = int(last_audit_cycle_number) + 1

        solution_name = solution_details.solution.name
        formatted_date = datetime.now().strftime('%b %Y')
        result = "{} {}".format(solution_name,formatted_date)
        
        name = "{} ({})".format(result, new_audit_cycle_number)

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
    
class MPOrderReportSerializer(ModelSerializer):
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','solution','user','created_at','modified_at')
   

class OrderReportsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    pagination_class = CustomPagination

    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        pages = request.query_params.get('pages') if 'pages' in request.query_params else None
        status = request.query_params.get('status') if 'status' in request.query_params else None
        valid_statuses = ['COMPLETE', 'ACTIVE']
        ALL = [valid_statuses]
        product_name = request.query_params.get('product_name')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        

        audit_cycles = AuditCycle.objects.filter(client=client.id)

        if pages =='dashboard':
            if status and status == 'DRAFT':
                mp_order = MPOrder.objects.filter(user=request.user, status=status)
                if mp_order:
                    mp_order = mp_order.order_by('-id')[:3] 
                    mp_order_data = []
                    for mp_order in mp_order:            
                        mp_order_data.append({
                            'mp_order': MPOrderReportSerializer(mp_order).data,
                        })
                    return Response({'mp_order_data': mp_order_data})
                else:
                    return Response({'message': 'No DRAFT status MPOrder found for this client.'})
            elif status and status in valid_statuses:
                audit_cycles = audit_cycles.filter(status=status).order_by('-id')[:3]
            else:
                return Response({'message': 'Invalid status parameter. Valid values are DRAFT, COMPLETE, ACTIVE, or ALL.'}, status=400)
        
        elif pages == 'reports':
            audit_cycles = AuditCycle.objects.filter(client=client.id)
            if status and status in ALL:
                audit_cycles = AuditCycle.objects.filter(client=client.id, status__in=ALL)
            if status and status in valid_statuses:
                audit_cycles = audit_cycles.filter(status=status)
            if product_name:
                audit_cycles = audit_cycles.filter(order_id__solution__name__icontains=product_name)
            if start_date_str:
                audit_cycles = audit_cycles.filter(start_date=start_date_str)
            if end_date_str:
                audit_cycles = audit_cycles.filter(end_date=end_date_str)
            
            paginator = self.pagination_class()
            audit_cycles = paginator.paginate_queryset(audit_cycles, request)
        
        else:
            return Response({'message': 'Invalid status parameter. Valid values are DRAFT, COMPLETE, ACTIVE, or ALL.'}, status=400)       

        audit_cycle_data = []

        for audit_cycle in audit_cycles:
            audit_score_response = audit_cycle.get_total_percentage()

            if audit_cycle.order is not None:
                order = audit_cycle.order

                audit_cycle_data.append({
                    'id': audit_cycle.id,
                    'audit_cycle': MPReportsAuditCycleSerializer(audit_cycle).data,
                    'order': MPReportsOrderSerializer(order).data,
                    'audit_score': audit_score_response,
                })
        
        if audit_cycle_data:
            if pages == 'reports':
                pagination = {
                    'page': paginator.page.number,
                    'total_pages': paginator.page.paginator.num_pages,
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                }
                response_data = {
                    'pagination': pagination,
                    'audit_cycle_data': audit_cycle_data,
                }
            else:
                response_data = {'audit_cycle_data': audit_cycle_data}
            
            return Response(response_data)
        else:
            return JsonResponse({'error': 'No audit cycles found for this client.'})

class MPReportsAuditCycleSerializer(ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = (
            'id',
            'name',
            'status',
            'start_date',
            'end_date',
            'planned_audit',
            'audit_count',
        )
        read_only_fields = fields


class MPReportsSolutionSerializer(ModelSerializer):
    class Meta:
        model = MPSolution
        fields = (
            'id',
            'name',
            'price',
        )
        read_only_fields = fields

class MPReportsOrderSerializer(ModelSerializer):
    solution = MPReportsSolutionSerializer()
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model=MPOrder
        # exclude = ('attachments',) 
        fields=('id','solution','category','category_name','no_of_response','status')         

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

        store_data = report_store_to_audit(audit_cycle_id,order,user)
        report_data = []
        report_data.append({
                    'audit_cycle': CustomAuditCycleSerializer(audit_cycle).data,
                    'audit_store_data':store_data,
                })
        if report_data:
            return Response({'audit_list': report_data})
        else:
            return JsonResponse({'error': 'No audit cycles found for this client.'})
        
def report_store_to_audit(audit_cycle_id, order,user):
        audit_stores = Audit.objects.filter(audit_cycle_id=audit_cycle_id)
        store_responses = []

        for audit in audit_stores:
            store_id = audit.store_id            
            stores = Store.objects.get(id=store_id)
            store_data = StoreDeSerializer(stores).data 

            data = {
                    'id': stores.id,
                    'audit_id': audit.id,
                    'audit_count': audit.count,
                    'audit_store': store_data,
                }
            store_responses.append(data)
        # audit_score = audit_section.get_audit_store_aggregation_for_client(audit_cycle_id, user.id)
        return ({'store_responses': store_responses})
    

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
            'address',
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
    category_name = serializers.CharField(source='category.name', read_only=True)
    attachments_data = serializers.SerializerMethodField()
    class Meta:
        model=MPOrder
        # exclude = ('attachments',) 
        fields=('id','solution','category','category_name','user','price','no_of_response','describe','status','alignment_factors','store','attachments_data','created_at','modified_at')
    def get_attachments_data(self, obj):
        attachments = obj.attachments.all()
        attachments_data = []

        for attachment in attachments:
            attachment_data = {
                'file_name': attachment.file_name,
                'mime_type': attachment.mime_type,
                'file_size': attachment.file_size,
            }
            attachments_data.append(attachment_data)

        return attachments_data
    
class MPOrderRepotsSerializer(ModelSerializer):
    user= UserSerializer()
    solution = SolutionSerializer()
    class Meta:
        model=MPOrder
        fields=('id','solution','user','price','no_of_response','describe','status','created_at','modified_at','payment_status')
    
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
            report_data=({
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
    pagination_class = CustomPagination
    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        client_profile = MPClientProfileInfo.objects.get(user=user.id)
        orders = MPOrder.objects.filter(user=client_profile.user, status__in=['ACTIVE', 'COMPLETE'])
        
        # status = request.query_params.get('status')
        # if status:
        #     orders = orders.filter(status=status)

        
        pages = request.query_params.get('pages') if 'pages' in request.query_params else None
        status = request.query_params.get('status') if 'status' in request.query_params else None
        valid =  ['COMPLETE', 'ACTIVE']
        ALL = [valid]
        product_name = request.query_params.get('product_name')
        year = request.query_params.get('year')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if pages=='invoice':
            orders = MPOrder.objects.filter(user=client_profile.user, status__in=['ACTIVE', 'COMPLETE'])
            if status and status in ALL :
                orders = MPOrder.objects.filter(client=client.id,status__in=ALL)
            if product_name:
                orders = orders.filter(solution__name__icontains=product_name)   
            if year:
                year = int(year)
                orders = orders.filter(transaction__payment_success_date__year=year)
            if start_date and end_date:
                orders = orders.filter(transaction__payment_success_date__date__range=(start_date,end_date))   

            paginator = self.pagination_class()
            orders = paginator.paginate_queryset(orders, request)   
        else:
            return JsonResponse({'error': 'No payment for any audit cycles.'})
        
        invoice_data_list = []
        for order in orders:
            order_data = MPOrderRepotsSerializer(order).data
            transaction = Transaction.objects.filter(order_id=order.id).first()
            invoice_data = {
                'client_profile_data': ClientProfileSerializer(client_profile).data,
                'order': order_data,
                'transaction': TransactionSerializer(transaction).data,
            }
            
            invoice_data_list.append(invoice_data)
        
        if invoice_data_list:
            pagination = {
                'page' : paginator.page.number,
                'total_pages' : paginator.page.paginator.num_pages,
                'next' : paginator.get_next_link(),
                'previous' : paginator.get_previous_link(),
            }
            response_data = {
                'pagination' : pagination,
                'invoice_data_list': invoice_data_list
            }
            return Response(response_data)
            # return Response({'invoice_data_list': invoice_data_list})
        else:
            return JsonResponse({'error': 'No payment for any audit cycles.'})   

class OrderInvoicesIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request,order_id):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        client_profile = MPClientProfileInfo.objects.get(user=user.id)
        try:
            order = MPOrder.objects.get(id=order_id)
        except MPOrder.DoesNotExist:
            return JsonResponse({'error': 'Order not found.'}, status=404)
        
        transaction = Transaction.objects.get(order_id=order_id)

        year_of_payment = transaction.payment_success_date.year
        month_of_payment = transaction.payment_success_date.month
        if month_of_payment >= 4:
            financial_year = year_of_payment  # Financial year starts from April
        else:
            financial_year = year_of_payment - 1 
        last_two_digits = financial_year % 100
        Invoice_number = "# {}/{}-{}0{}".format("INV",financial_year,last_two_digits,transaction.id)
        
        invoice_data = {
                'Invoice_number' : Invoice_number,
                'client_profile_data': ClientProfileSerializer(client_profile).data,
                'order_data': MPOrderRepotsSerializer(order).data,
                'transaction': TransactionSerializer(transaction).data,
            }
        
        if invoice_data:
            return Response({'invoice_data': invoice_data})
        else:
            return JsonResponse({'error': 'No payment for any audit cycles.'})   

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields=('id','payment_success_date')

class AuditByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request, audit_cycle_id, format=None):
        audits = find_audits_by_audit_cycle_id(audit_cycle_id)
        serial_audits = AuditSerializer(audits, many=True).data
        return Response(serial_audits)
    
def find_audits_by_audit_cycle_id(audit_cycle_id):
    return Audit.objects.filter(audit_cycle_id=audit_cycle_id).prefetch_related(
        'store',
        'store__client',
        'store__city',
        'audit_stores',
        'audit_stores__user',
        'audit_stores__user__profileinfo',
        'applications',
        'applications__profileinfo',
        'applications__profileinfo__user',
        'audit_cycle__questionnaire_type',
        'audit_cycle__audits',
    )

class AuditSerializer(ModelSerializer):
    # StoreSerializer
    store = StoreDeSerializer()
    audit_cycle = AuditCycleSerializer()
    class Meta:
        model = Audit
        fields = (
            'id',
            'count',
            'audit_date',
            'hidden',
            'earnings_per_audit',
            'reimbursement',
            'store',
            'audit_cycle',
            'post_approval_description',
            'application_count',
            'report_count',
            'valid_report_count',
        )
        read_only_fields = fields
    

class AuditStoreByAuditClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }
    def get(self, request, audit_id, format=None):
        audit_stores = find_by_audit_with_status(audit_id, ['COMPLETED', 'ACCEPTED'])
        if not audit_stores:
            return Response({"message": "No reports available"})
        return Response(AuditStoreSerializerWithoutAudit(audit_stores, many=True).data)
    
def find_by_audit_with_status(audit_id, status_list):
    return AuditStore.objects.filter(audit_id=audit_id, status__in=status_list).prefetch_related(
        'user',
        'user__profileinfo',
    )

class AuditStoreSerializerWithoutAudit(ModelSerializer):
    user = UserSerializer()
    # assigned_to_moderator = PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AuditStore
        fields = (
            'id',
            'status',
            'audit_date',
            'audit',
            'user',
            'qa_rating',
            # 'assigned_to_moderator',
            'attribute_data',
            # 'report_revert_count'
        )
        read_only_fields = fields

class MPOrderList(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    pagination_class = CustomPagination
    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        valid_statuses = ['DRAFT', 'COMPLETE', 'ACTIVE']
        status = request.query_params.get('status')
        if status and status == 'ALL':
            mp_order = MPOrder.objects.filter(user=request.user, status__in=valid_statuses)
        elif status and status in valid_statuses:
            mp_order = MPOrder.objects.filter(user=request.user, status=status)
        else:
            return Response({'message': 'Invalid status parameter. Valid values are DRAFT, COMPLETE, ACTIVE, or ALL.'}, status=400)

        mp_order_data = [{'mp_order': MPOrderSerializer(mp_order_item).data} for mp_order_item in mp_order]
        return Response({'mp_order_data': mp_order_data})
    
class AuditCycleDetailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }

    def get(self,request,audit_cycle_id):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return JsonResponse({'error': 'Client not found for this user.'}, status=404)
        
        audit_cycle = AuditCycle.objects.get(client=client.id,id=audit_cycle_id)
        
        if audit_cycle.order is not None:
                order = MPOrder.objects.get(id=audit_cycle.order.id)
                store_info = order.store
                store_count = len(store_info) if store_info else 0
                audit_cycle_data = ({
                    'id': audit_cycle.id,
                    'audit_cycle': AuditCycleSerializer(audit_cycle).data,
                    'order': MPOrderSerializer(order).data,
                    # 'audit_score': audit_score_response,
                    'store_info': store_info,
                    'store_count': store_count,
                })
        if audit_cycle_data:
            return Response({'audit_cycle_data': audit_cycle_data})
        else:
            return JsonResponse({'error': 'No audit cycles found for this client.'})


class StoreSearchView(APIView):
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
           
        name = request.query_params.get('name')
        city = request.query_params.get('city')
        state = request.query_params.get('state')
        status = request.query_params.get('status')

        if not (name or city or state or status):
            return Response({'error': 'At least one of the parameters (name, city, state, status) is required.'}, status=404)

        queryset = Store.objects.filter(client=client)

        if name:
            queryset = queryset.filter(name__istartswith=name)
        if city:
            queryset = queryset.filter(city__name__icontains=city)
        if state:
            queryset = queryset.filter(city__state__icontains=state)
        if status :
            if status.upper() == 'ALL':
                queryset = Store.objects.filter(client=client)
            else:
                return Response({'error': 'Invalid value for the "status" parameter. It should be "ALL" to retrieve all data.'}, status=404)
        if not queryset.exists():
            return Response({'error': 'No records found for the given query parameters.'}, status=404)

        serializer = StoreSerializer(queryset, many=True)
        return Response(serializer.data, status=200)

class ClientStoreLocationsList(APIView):
    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found for this user.'}, status=404)

        client_stores = Store.objects.filter(client=client)

        states = {}
        cities = set()

        for store in client_stores:
            state_code = store.city.state
            state_name=store.city.state_name()
            city_name = store.city.name              

            states[state_code] = state_name
            cities.add(city_name)

        response_data = {
            'states': states,
            'cities': list(cities),
        }

        return Response(response_data)

class MPOrderReportProductLisrView(APIView):
    def get(self, request):
        user = request.user
        try:
            client = Client.objects.get(email=user.email)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found for this user.'}, status=404)

        product_name_list = AuditCycle.objects.filter(client=client).values_list(
            'order__solution__name', flat=True
        ).distinct()

        return Response({'unique_product_names': product_name_list})
    
class OrderInvoceProductListView(APIView):

    def get(self, request):
        user = request.user
        try:
            client_profile = MPClientProfileInfo.objects.get(user=user.id)
        except MPClientProfileInfo.DoesNotExist:
            return Response({'error': 'Client profile not found for this user.'}, status=404)


        orders = MPOrder.objects.filter(user=client_profile.user, status__in=['ACTIVE', 'COMPLETE'])
        orders = orders.filter(transaction__isnull=False)

        invoice_project_names = orders.values_list('solution__name', flat=True).distinct()

        return Response({'invoice_project_names': invoice_project_names})
    