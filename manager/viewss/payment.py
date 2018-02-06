from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from payment.service import payment_manager as payment_service

from ..serializers import PaymentUserSerializer

class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, audit_cycle_id, format=None):
        payments = payment_service.find_by_audit_cycle(audit_cycle_id)
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
        count = payment_service.pay_all_pending_for_audit_cycle(audit_cycle_id, request.user)
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


class PaymentIdPayView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, payment_id):
        payment = payment_service.pay(payment_id, request.user)
        return Response(PaymentUserSerializer(payment).data)

class PaymentIdUnpayView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }

    def post(self, request, payment_id):
        payment = payment_service.unpay(payment_id, request.user)
        return Response(PaymentUserSerializer(payment).data)
