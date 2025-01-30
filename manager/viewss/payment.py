from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, ReadOnlyField

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from payment.service import payment_manager as payment_service
from payment.models import Payment
from rest_framework.permissions import AllowAny

from manager.serializers import UserSerializer

class PaymentUserSerializer(ModelSerializer):
    user = UserSerializer()
    audit_date = ReadOnlyField(source='audit_store.audit_date')
    class Meta:
        model = Payment
        fields = (
            'id',
            'comment',
            'amount',
            'status',
            'user',
            'audit_store_id',
            'added_on',
            'paid_on',
            'audit_date',
        )
        read_only_fields = fields

class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        payments = payment_service.find_by_audit_cycle(audit_cycle_id)
        return Response(PaymentUserSerializer(payments, many=True).data)

    def post(self, request, audit_cycle_id, format=None):
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        payments = payment_service.find_by_audit_cycle_and_date(audit_cycle_id, start_date, end_date)
        return Response(PaymentUserSerializer(payments, many=True).data)

class PendingPaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        payments = payment_service.find_pending_by_audit_cycle(audit_cycle_id)
        return Response(PaymentUserSerializer(payments, many=True).data)

class PayAllPendingPaymentsForAuditCycle(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, audit_cycle_id, format=None):
        start_date = request.POST.get('start_date','')
        end_date = request.POST.get('end_date', '')
        count = payment_service.pay_all_pending_for_audit_cycle(audit_cycle_id, request.user, start_date, end_date)
        return Response(count)

class PendingPaymentCsvView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        data, filename = payment_service.find_new_pending_csv_for_audit_cycle(audit_cycle_id)
        response = HttpResponse(data.read(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="' + filename + '"'
        return response


class PendingPaymentXlsxView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        report, name = payment_service.find_new_pending_xlsx_for_audit_cycle(audit_cycle_id, start_date, end_date)        
    #     # response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    #     # response['Content-Disposition'] = 'attachment; filename="' + name + '"'
    #     # return response

        if isinstance(report, str):
            error_message = report
            return HttpResponse(error_message, status=400, content_type='text/plain')
        else:
            response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="' + name + '"'
            return response


class PaymentIdPayView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, payment_id):
        payment = payment_service.pay(payment_id, request.user)
        return Response(PaymentUserSerializer(payment).data)


class PaymentIdFailView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, payment_id):
        payment = payment_service.fail(payment_id, request.user)
        payments = payment_service.find_by_audit_store(payment.audit_store)
        return Response(PaymentUserSerializer(payments, many=True).data)

class FailPayPaymentIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, payment_id):
        payment = payment_service.fail_and_pay(payment_id, request.user)
        payments = payment_service.find_by_audit_store(payment.audit_store)
        return Response(PaymentUserSerializer(payments, many=True).data)
