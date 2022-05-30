from django.conf import settings
from billing.models import Payment
from client.models import Quotation
from kronos.exceptions import AppLogicError
from kronos.utils import find_audit_volume_discount, get_audit_category_list, get_audit_type_list, get_industry_list, get_markup_price, get_tier_markup_list

from client.service import client_service

def get_quotation_preview_data(quotation_data: dict) -> dict:
    """
    Generate quotation preview data with
    industry, audit type, audit category, audit location
    """
    industry_id = quotation_data.get('industry', '')
    audit_type_id = quotation_data.get('audit_type', '')
    audit_category_id = quotation_data.get('audit_category', '')
    audit_locations = quotation_data.get('audit_locations', '')

    if not industry_id or not audit_category_id or not audit_type_id or not audit_locations:
        raise AppLogicError("Something went wrong")

    industry = get_industry_by_id(industry_id)
    audit_type = get_audit_type_by_id(audit_type_id)
    audit_category = get_audit_category_by_id(audit_category_id)
    tier_wise_markup_list = get_tier_markup_list()

    industry_base_rate = industry['base_rate']
    audit_type_markup_price = get_markup_price(industry_base_rate, audit_type['markup'])
    audit_category_markup_price = get_markup_price(industry_base_rate, audit_category['markup'])

    base_audit_price = industry_base_rate + audit_type_markup_price + audit_category_markup_price

    total_audit_fee = 0
    total_audit_count = 0
    for location in audit_locations:
        audit_count = location['audit_count']
        tier_audit_fee = get_markup_price(industry_base_rate, tier_wise_markup_list[str(location['tier'])])

        audit_fee = round((base_audit_price + tier_audit_fee) * float(audit_count))
        location['audit_fee'] = audit_fee
        total_audit_fee += audit_fee
        total_audit_count += int(audit_count)

    gst_amount = (total_audit_fee * int(settings.CLIENT_QUOTATION_GST)) / 100
    payable_amount = total_audit_fee + gst_amount

    audit_volume_discount = find_audit_volume_discount(total_audit_count)
    audit_volume_discount_amount = 0
    if audit_volume_discount:
        audit_volume_discount_amount = round(get_markup_price(payable_amount, audit_volume_discount))
        payable_amount -= audit_volume_discount_amount

    result = {
        'industry': {
            'id': industry['id'],
            'name': industry['name']
        },
        'audit_type': {
            'id': audit_type['id'],
            'name': audit_type['name']
        },
        'audit_category': {
            'id': audit_category['id'],
            'name': audit_category['name']
        },
        'audit_locations':audit_locations,
        'quotation_fee': total_audit_fee,
        'gst_amount': gst_amount,
        'gst': settings.CLIENT_QUOTATION_GST,
        'discount': audit_volume_discount_amount,
        'payable_amount': payable_amount
    }
    return result

def get_industry_by_id(industry_id: int) -> dict:
    industry_list = get_industry_list()
    industry = {}
    for ind in industry_list:
        if int(ind['id']) == int(industry_id):
            industry = ind
            break
    return industry

def get_audit_type_by_id(audit_type_id) -> dict:
    audit_type_list = get_audit_type_list()
    audit_type = {}
    for a_type in audit_type_list:
        if a_type['id'] == int(audit_type_id):
            audit_type = a_type
            break
    return audit_type

def get_audit_category_by_id(audit_category_id) -> dict:
    audit_category_list = get_audit_category_list()
    audit_category = {}
    for a_category in audit_category_list:
        if a_category['id'] == int(audit_category_id):
            audit_category = a_category
            break
    return audit_category

def insert_quotation_data(client_id: int, quotation: dict) -> Quotation:
    client = client_service.find_client_by_id(client_id)
    quotation_data = Quotation.objects.create(quotation_data=quotation['quotation'], status=Quotation.PENDING, client=client)
    return quotation_data

def find_by_id(quotation_id: int)-> Quotation:
    try:
        quotation = Quotation.objects.get(id=quotation_id)
    except Quotation.DoesNotExist as e:
        raise AppLogicError('Quotation not found')
    return quotation

def find_payments_by_client_id(client_id: int):
    """
    Returns the quotation payment list
    """
    return Payment.objects.filter(quotations__client_id = client_id)