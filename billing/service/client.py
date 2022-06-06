from django.conf import settings
from django.utils import timezone
from django.db.transaction import atomic
from django.template.loader import render_to_string

from billing.models import Payment
from client.models import BankInfo, Quotation

from client.service.client_service import find_client_by_id
from client.service import quotation as quotation_service
from billing.service import payment as payment_service
from kronos.exceptions import AppLogicError
from kronos.utils import generate_pdf_from_api

import razorpay
from razorpay.errors import SignatureVerificationError


@atomic
def create_payment_order(client_id: int, data: dict) -> dict:
    """
    Function to create payment order for client quotation
    """
    if not settings.RAZORPAY_SWITCH:
        raise AppLogicError('Currently payment is not accepted')

    find_client_by_id(client_id)
    checkout_data = get_checkout_data(data)
    quotation = quotation_service.find_by_id(data['quotation_id'])
    gst = int(quotation.quotation_data['gst'])
    payable_amount = int(data['payable_amount'])

    if quotation.status == Quotation.PAID:
        raise AppLogicError("Quotation is already paid")

    payment = Payment.objects.create(amount = payable_amount, content_object = quotation, payment_data = checkout_data, gst = gst)
    data = {
        'amount': payable_amount * 100,
        'currency': 'INR',
        'receipt': payment.invoice_number,
    }

    razorpay_resp = create_razorpay_order(data)
    result = {
        'key': settings.RAZORPAY_ACCESS_KEY,
        'merchant_logo': settings.RAZORPAY_MERCHANT_LOGO,
        'amount':razorpay_resp['amount'],
        'currency': razorpay_resp['currency'],
        'name': settings.BRAND_NAME,
        'order_id': razorpay_resp['id'],
    }
    payment.status = Payment.PENDING
    payment.payment_order_id = razorpay_resp['id']
    payment.save()
    return result


def get_checkout_data(data):
    """ Function to get checkout fields from input dict """
    result = {}
    checkout_fields = ['company_name', 'billing_name', 'address', 'postal_code', 'city', 'country', 'po_number', 'gstin_number']
    for key, val in data.items():
        if key in checkout_fields:
            result[key] = val
        else:
            result[key] = ''
    return {'checkout': result}


def create_razorpay_order(data: dict):
    client = razorpay.Client(auth=(settings.RAZORPAY_ACCESS_KEY, settings.RAZORPAY_SECRET_KEY))
    order = client.order.create(data=data)
    return order


@atomic
def validate_payment_order_response(client_id, data: dict) -> bool:
    """ Function to validate payment response initiated by client """

    client = find_client_by_id(client_id)

    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    if not razorpay_payment_id or not razorpay_order_id or not razorpay_signature:
        raise AppLogicError("Invalid payment order response")

    client = razorpay.Client(auth=(settings.RAZORPAY_ACCESS_KEY, settings.RAZORPAY_SECRET_KEY))

    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
    except SignatureVerificationError as e:
        raise AppLogicError(e)

    payment = find_by_payment_order_id(razorpay_order_id)

    payment.status = Payment.PAID
    payment_data = payment.payment_data
    payment_data['response'] = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }
    payment.paid_on = timezone.now()
    payment.payment_data = payment_data
    payment.save()

    # Change quotation status after payment is complete
    quotation = payment.quotations.latest('id')
    quotation.status = Quotation.PAID
    quotation.save()

    return True

def find_by_payment_order_id(payment_order_id: str):
    """ Function to get payment objects from payment order id
    payment_order_id: Received from payment gateway after payment is done
    """
    try:
        payment = Payment.objects.get(payment_order_id = payment_order_id)
    except Payment.DoesNotExist as e:
        raise AppLogicError("Payment details not found")
    return payment

@atomic
def failed_payment_order(data: dict) -> bool:
    """ Function to fail payment object initiated by client """

    payment = find_by_payment_order_id(data.get('order_id', ''))
    errors = {
        'code': data.get('code', ''),
        'description': data.get('description', ''),
        'reason': data.get('reason', ''),
        'payment_id': data.get('payment_id', ''),
    }
    payment_data = payment.payment_data
    payment_data['errors'] = errors
    payment.payment_data = payment_data
    payment.status = Payment.FAILED
    payment.save()
    return True

# def get_payments_by_client_id(client_id: int):
#     payments = Payment.objects.filter(clients__id = client_id, status__in = [Payment.PAID, Payment.FAILED]).order_by('-id')
#     return payments

# def get_paid_payments_by_client_id(client_id: int):
#     payments = Payment.objects.filter(clients__id = client_id, status = Payment.PAID).order_by('-id')
#     return payments

# def get_used_account_balance_by_client(client_id: int):
#     audit_stores = AuditStore.objects.filter(audit__audit_cycle__created_by_client = True, audit__audit_cycle__client_id = client_id)
#     total = 0
#     for store in audit_stores:
#         earnings_per_audit = store.earnings_per_audit if store.earnings_per_audit else 0
#         reimbursement = store.reimbursement if store.reimbursement else 0
#         total += (earnings_per_audit + reimbursement)
#     return total


# def get_account_balance_by_client_id(client_id: int):
#     total = get_paid_payments_by_client_id(client_id).aggregate(total = Sum('amount'))
#     total = total['total'] if total['total'] else 0
#     used_balance = get_used_account_balance_by_client(client_id)
#     remain_balance = total - used_balance
#     return remain_balance


def get_payment_invoice(payment_id: int, client_id: int):
    invoice_data = get_invoice_data_from_payment_id(payment_id, client_id)
    html_data = render_to_string("notify/quotation_payment_invoice.html", context = invoice_data)
    pdf = generate_pdf_from_api(html_data)
    return pdf


def get_invoice_data_from_payment_id(payment_id: int, client_id: int) -> dict:
    """Get quotation invoice data from checkout details and payment object"""

    client = find_client_by_id(client_id)
    payment = payment_service.get_by_id(payment_id)

    try:
        gstin = client.client_bank_info.gstin
    except BankInfo.DoesNotExist as e:
        gstin = ''

    try:
        quotation = Quotation.objects.get(pk=payment.object_id)
    except Quotation.DoesNotExist as e:
        raise AppLogicError("Quotation not found")

    if not quotation.quotation_data:
        raise AppLogicError("Invalid quotation")

    checkout_data = payment.payment_data['checkout'] if 'checkout' in payment.payment_data else {}
    quotation_data = quotation.quotation_data

    data = {
        'invoice_no': payment.invoice_number,
        'invoice_date': payment.invoice_date,
        'quotation': {
            'industry': quotation_data['industry'],
            'audit_type': quotation_data['audit_type'],
            'audit_category': quotation_data['audit_category'],
            'audit_locations': quotation_data['audit_locations'],
            'payable_amount': quotation_data['payable_amount'],
            'gst': quotation_data['gst'],
            'gst_amount': quotation_data['gst_amount'],
            'discount': quotation_data['discount'],
            'quotation_fee': quotation_data['quotation_fee'],
        },
        'to': {
            'company_name': checkout_data.get('billing_name', client.name),
            'address': checkout_data.get('address', client.address),
            'gstin': checkout_data.get('gstin', gstin),
            'email': client.email,
            'phone_no': checkout_data.get('po_number', client.phone),
        },
        'from': {
            'company_name': settings.BRAND_NAME,
            'address': settings.BRAND_ADDRESS,
            'gstin': settings.BRAND_GSTIN,
            'email': settings.ACCOUNTS_EMAIL,
            'logo': settings.BRAND_LOGO,
        }
    }
    return data