from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.serializers import PrimaryKeyRelatedField, BooleanField, IntegerField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from manager.serializers import PlainUserSerializer
from client.service import client_service
from client.models import ClientRequirements, Client
from datetime import datetime
from rest_framework import serializers
from audit.models import AuditCycle
from manager.service import client_requirement_attachment_service
from manager.serializers import AttachmentSerializer,CategorySerializer
from rest_framework.exceptions import ValidationError




class ClientRequirementSerializer(ModelSerializer):
    class Meta:
        model = ClientRequirements
        fields = (
            'id',
            'name',
            'client',
            'start_date',
            'end_date',
            'problem_statement',
            'type',
            'audit_count_with_type',
            'category',
            'questionnaire_type',
            'setup_fee',
            'price_per_audit',
            'execution_budget',
            'scope_of_work',
            'audit_flow',
            'project_manager_email',
            'sales_representative_email',
            'created_at',
            'modified_at',
        )
        read_only_fields = ('id',)
    name = serializers.CharField(required=False, read_only=True)
 
    def create(self, validated_data):
        start_date = validated_data.get('start_date')
        if start_date:
            validated_data['name'] = start_date.strftime('%d-%b-%Y')

        client_requirement = super().create(validated_data)
        return client_requirement

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            client_requirements = ClientRequirements.objects.get(id=self.context.get('id'))
        else:
            client_requirements = ClientRequirements()
        client_requirements.name = self.validated_data.get('name', client_requirements.name)
        client_requirements.client = self.validated_data.get('client', client_requirements.client)
        client_requirements.start_date = self.validated_data.get('start_date', client_requirements.start_date)
        client_requirements.end_date = self.validated_data.get('end_date', client_requirements.end_date)
        client_requirements.problem_statement = self.validated_data.get('problem_statement', client_requirements.problem_statement)
        client_requirements.type = self.validated_data.get('type', client_requirements.type)
        client_requirements.audit_count_with_type = self.validated_data.get('audit_count_with_type', client_requirements.audit_count_with_type)
        client_requirements.category = self.validated_data.get('category', client_requirements.category)
        client_requirements.questionnaire_type = self.validated_data.get('questionnaire_type', client_requirements.questionnaire_type)
        client_requirements.setup_fee = self.validated_data.get('setup_fee', client_requirements.setup_fee)
        client_requirements.price_per_audit = self.validated_data.get('price_per_audit', client_requirements.price_per_audit)
        client_requirements.execution_budget = self.validated_data.get('execution_budget', client_requirements.execution_budget)
        client_requirements.scope_of_work = self.validated_data.get('scope_of_work', client_requirements.scope_of_work)
        client_requirements.audit_flow = self.validated_data.get('audit_flow', client_requirements.audit_flow)
        client_requirements.project_manager_email = self.validated_data.get('project_manager_email', client_requirements.project_manager_email)
        client_requirements.sales_representative_email = self.validated_data.get('sales_representative_email', client_requirements.sales_representative_email)
        client_requirements.save()
        return client_requirements


class ClientRequirementsView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,client_id):
        requirements = client_service.find_client_requirements_by_client_id(client_id)
        serializer=ClientRequirementSerializer(requirements,many=True)
        return Response(serializer.data)
    
    def post(self, request, client_id):
        data = request.data.copy()       
        data['client'] = client_id

        serializer = ClientRequirementSerializer(data=data)

        if serializer.is_valid():
            client_requirement = serializer.save()

            response_data = {
                "message": "Client requirement created successfully",
                "client_requirement_id": client_requirement.id,
            }
            return Response(response_data, status=201)
        else:
            return Response(serializer.errors, status=400)

class ClientRequirementsIdView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }

    def delete(self,request,client_requirements_id):    
        try:
            client_requirement = ClientRequirements.objects.get(id=client_requirements_id)
            client_requirement.delete()
            return Response({"message": "Client requirement deleted successfully"}, status=204)
        except ClientRequirements.DoesNotExist:
            return Response({"error": "Client requirement not found"}, status=404)
    def post(self,request,client_requirements_id):
        client_requirement = ClientRequirements.objects.get(id=client_requirements_id)
        if client_requirement is None:
            return Response({"error": "Client requirement not found"}, status=404)
        
        serializer = ClientRequirementSerializer(client_requirement,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "client requirement updated successfully"})
        else:
            return Response(serializer.errors,status=400)
    
class ClientReqAuditView(APIView):
    def post(self, request, audit_cycle_id):
        try:
            audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
            client_requirements_id = request.data.get('client_requirements_id')
            client_requirement = ClientRequirements.objects.get(id=client_requirements_id)
            
            audit_cycle.clientrequirement = client_requirement
            audit_cycle.save()
            
            return Response({"message": "Audit cycle updated successfully"}, status=200)
        except AuditCycle.DoesNotExist:
            return Response({"message": "Audit cycle not found"}, status=404)
        except ClientRequirements.DoesNotExist:
            return Response({"message": "Client requirement not found"}, status=404)

class ClientRequirementAttachmentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER]
    }
    def get(self, request, client_requirements_id):
        attachment = client_requirement_attachment_service.find_attachment_by_clintrequiremnent_id(client_requirements_id)
        return Response(AttachmentSerializer(attachment,many=True).data)
    
    def post(self,request,client_requirements_id):
        try:
            post_data, attachment = client_requirement_attachment_service.clientrequiremnet_image_upload_by_client_requirements_id(
                client_requirements_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
class ClientRequirementDeleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }
    def delete(self,request,attachment_id):
        client_requirement_attachment_service.delete_for_clientrequiremnet(attachment_id,request.data)
        return Response()

class ClientRequirementAttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, attachment_id):
        attachment = client_requirement_attachment_service.complete_for_clientrequiremnet(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)

