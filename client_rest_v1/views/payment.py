from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from client.service.client_service import find_client_by_user_id
from kronos.exceptions import AppLogicError

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_CLIENT

from billing.service import client as client_payment_service

from ..serializers import ClientCheckOutSerializer, ClientPaymentSerializer


class PaymentView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
    }

    def get(self, request, client_id):
        payments = client_payment_service.get_payments_by_client_id(client_id)
        return Response(ClientPaymentSerializer(payments, many=True).data)

    def post(self, request, client_id, format=None):
        serializer = ClientCheckOutSerializer(data = request.data)
        resp = {}
        if serializer.is_valid(raise_exception=True):
            client = client_payment_service.create_payment_order(client_id, request.data)
            resp = client
        if not resp:
            raise AppLogicError("Error while creating order")
        return Response(resp)


class PaymentResponseView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }

    def post(self, request, client_id, format=None):
        response = {
            'razorpay_payment_id': request.data.get('razorpay_payment_id'),
            'razorpay_order_id': request.data.get('razorpay_order_id'),
            'razorpay_signature': request.data.get('razorpay_signature')
        }
        verified = client_payment_service.validate_payment_order_response(client_id, response)
        return Response({'verified': verified})

class PaymentFailedView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }

    def post(self, request, format=None):
        data = request.data
        payment = client_payment_service.failed_payment_order(data)
        return Response({'failed': payment})

class AccountBalancView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request):
        client = find_client_by_user_id(request.user.id)
        balance = client_payment_service.get_account_balance_by_client_id(client.id)
        return Response(balance)

class PaymentInvoiceView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
    }

    def get(self, request, client_id, payment_id, format=None):
        invoice = client_payment_service.get_payment_invoice(payment_id, client_id)
        response = HttpResponse(invoice, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="invoice.pdf"'
        return response