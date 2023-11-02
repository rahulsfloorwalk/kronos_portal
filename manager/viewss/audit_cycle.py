from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField, ModelSerializer, IntegerField
from rest_framework.exceptions import ValidationError
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from audit.service import audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from auditor.service import application_service
from questionnaire.service import questionnaire as questionnaire_service
from manager.serializers import AuditCycleSerializer,AttachmentSerializer
from manager.service import audit_cycle_attachment_service
from audit.models import AuditCycle
from kronos.exceptions import AppLogicError

class AuditCycleDeSerializer(ModelSerializer):
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
            'eligibility',
            'client',
            'questionnaire_type',
            'audit_auto_approve',
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
        audit_cycle.eligibility = self.validated_data.get('eligibility', audit_cycle.eligibility)
        audit_cycle.audit_auto_approve = self.validated_data.get('audit_auto_approve', audit_cycle.audit_auto_approve)
        audit_cycle.client = self.validated_data.get('client', audit_cycle.client_id)
        audit_cycle.questionnaire_type = self.validated_data.get('questionnaire_type', audit_cycle.questionnaire_type)
        return audit_cycle


class AuditCycleViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        audit_cycles,total_count = audit_cycle_service.find_audit_cycles_by_client_limit(client_id,request.GET.get('is_load_more'),request.GET.get('last_total_count'))
        # return Response(AuditCycleSerializer(audit_cycles, many=True).data)
        return Response({'audit_cycles':AuditCycleSerializer(audit_cycles,many=True).data,'total_count':total_count})

class AuditCycleView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data)
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

class AuditCycleIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, audit_cycle_id, format=None):
        audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
        return Response(AuditCycleSerializer(audit_cycle).data)

    def post(self, request, audit_cycle_id):
        audit_cycle_ds = AuditCycleDeSerializer(data=request.data, context={'id': audit_cycle_id})
        audit_cycle_ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_ds.deserialize()
        saved_audit_cycle = audit_cycle_service.save(audit_cycle)
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

    def delete(self, request, audit_cycle_id):
        audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
        audit_cycle.delete()
        return Response(status=204)


class AuditCycleIdPostApprovalDescriptionView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    class DeSerializer(Serializer):
        post_approval_description = CharField(allow_blank=True, max_length=16384)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_cycle = audit_cycle_service.set_post_approval_description(audit_cycle_id, ds.validated_data["post_approval_description"])
        return Response(AuditCycleSerializer(saved_audit_cycle).data)

class AuditCycleIdEligibilityAuditorView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    class DeSerializer(Serializer):
        eligibility = CharField(allow_blank=True, max_length=16384)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        saved_audit_cycle = audit_cycle_service.set_eligibility_for_auditor(audit_cycle_id, ds.validated_data["eligibility"])
        return Response(AuditCycleSerializer(saved_audit_cycle).data)
class AuditCycleIdCheckPointsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        checkpoints = CharField(allow_blank=True, max_length=20480)

    def post(self, request, audit_cycle_id):
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_service.set_checkpoints(audit_cycle_id, ds.validated_data['checkpoints'])
        return Response(AuditCycleSerializer(audit_cycle).data)

class AuditCycleIdChargePerAuditView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        charge_per_audit = IntegerField(min_value = 0)

    def post(self, request, audit_cycle_id):
        if not request.user.has_perm('manager.can_change_price_per_audit'):
            raise AppLogicError('Permission denied')
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_service.set_charge_per_audit(audit_cycle_id, ds.validated_data['charge_per_audit'])
        return Response(AuditCycleSerializer(audit_cycle).data)

class AuditCycleIdSystemCostView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    class DeSerializer(Serializer):
        system_cost = IntegerField(min_value = 0)

    def post(self, request, audit_cycle_id):
        if not request.user.has_perm('manager.can_change_system_cost'):
            raise AppLogicError('Permission denied')
        ds = self.DeSerializer(data=request.data)
        ds.is_valid(raise_exception=True)
        audit_cycle = audit_cycle_service.set_system_cost(audit_cycle_id, ds.validated_data['system_cost'])
        return Response(AuditCycleSerializer(audit_cycle).data)

class ExportQuestionnaire(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        report, name = questionnaire_service.export_questionnaire(audit_cycle_id)
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response

# class AuditCycleDetailsFromClientView(APIView):
#     permission_classes=[HasGroupPermission]
#     required_groups={
#         'GET':[GROUP_NAME_MANAGER],
#     }
#     def get(self,request,audit_cycle_id,format=None):
#         result = audit_cycle_service.find_order_description_and_files_by_audit_cycle_id(audit_cycle_id)
#         return Response(result)
    
class AuditCycleDashboard(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        return Response(audit_cycle_service.get_audit_cycle_dashboard())

class AuditCycleDashboardStatusViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        audit_cycles = audit_cycle_service.find_audit_cycles_with_dashboard_status_by_client(client_id)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)

class AuditCycleRejectAllApplicationsView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_cycle_id):
        rejected_applications = application_service.reject_all_applications_for_audit_cycle(audit_cycle_id, request.user)
        return Response(len(rejected_applications))


class AuditCycleApplicationStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        stats = application_service.get_application_stats(audit_cycle_id)
        return Response(stats)


class AuditCycleAuditStoreStats(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id):
        stats = audit_store_service.get_audit_store_stats(audit_cycle_id)
        return Response(stats)

class AuditDetailsCopyByAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }

    def post(self, request, to_audit_cycle_id):
        audit_cycle = audit_cycle_service.copy_audit_details_from_to(request.data.get("from_audit_cycle_id"),
                                                                     to_audit_cycle_id,
                                                                     request.data.get("checkpoints"),
                                                                     request.data.get("post_approval_desc"),
                                                                     request.data.get("proof_tags"),
                                                                     request.data.get("audit_alignment_factors"))
        return Response(AuditCycleSerializer(audit_cycle).data)


class AuditCycleViewByManager(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, manager_id, format=None):
        month = request.data.get("month", '')
        year = request.data.get("year", '')
        audit_cycles = audit_cycle_service.filter_audit_cycle_by_manager(manager_id, month, year)
        return Response(AuditCycleSerializer(audit_cycles, many=True).data)


class AuditAlignmentFactors(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET':[GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self,request,audit_cycle_id,format=None):
        audit_alignment_factors = audit_cycle_service.get_audit_alignment_factor_by_audit_cycle(audit_cycle_id)
        return Response(audit_alignment_factors)
    def post(self, request, audit_cycle_id, format=None):
        audit_cycles = audit_cycle_service.set_audit_alignment_factor_by_audit_cycle(audit_cycle_id, request.data)
        return Response(AuditCycleSerializer(audit_cycles).data)
    
    
class AuditCycleAttachmentView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups ={
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,audit_cycle_id):
        attachment = audit_cycle_attachment_service.find_attachment_by_audit_cycle_id(audit_cycle_id)
        return Response(AttachmentSerializer(attachment,many=True).data)    
    def post(self,request,audit_cycle_id):
        try:
            post_data,attachment = audit_cycle_attachment_service.audit_cycle_image_upload_by_audit_cycle_id(
                audit_cycle_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"]) 
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
            

class AuditCycleDeleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }
    def delete(self,request,attachment_id):
        audit_cycle_attachment_service.delete_for_audit_cycle(attachment_id,request.data)
        return Response()
    
class AuditCycleAttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, attachment_id):
        attachment = audit_cycle_attachment_service.complete_for_audit_cycle(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)