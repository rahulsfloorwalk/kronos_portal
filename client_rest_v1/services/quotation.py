from django.conf import settings
from django.db.transaction import atomic
from billing.models import Payment
from client.models import Quotation
from audit.models.audit import AuditLocation
from kronos.exceptions import AppLogicError
from kronos.utils import find_audit_volume_discount, get_gst_amount, get_markup_price, get_tier_markup_list

from client.service import client_service
from questionnaire.service import questionnaire as questionnaire_service
from manager.service import city_service

def get_quotation_preview_data(quotation_data: dict) -> dict:
    """
    Generate quotation preview data with
    industry, audit type, audit category, audit location
    """
    industry_id = quotation_data.get('industry', '')
    problem_statement_id = quotation_data.get('problem_statement', '')
    sample_questionnaire_type_id = quotation_data.get('sample_questionnaire_type', '')
    audit_locations = quotation_data.get('audit_locations', '')

    if not industry_id or not problem_statement_id or not sample_questionnaire_type_id or not audit_locations:
        raise AppLogicError("Something went wrong")

    industry = questionnaire_service.get_industry_by_id(industry_id)
    problem_statement = questionnaire_service.get_problem_statement_by_id(problem_statement_id)
    sample_questionnaire_type = questionnaire_service.get_sample_questionnaire_type_by_id(sample_questionnaire_type_id)
    tier_wise_markup_list = get_tier_markup_list()

    base_audit_price = industry.base_rate + problem_statement.markup_price + sample_questionnaire_type.markup_price

    total_audit_fee = 0
    total_audit_count = 0
    for location in audit_locations:
        audit_count = location['audit_count']
        tier_audit_fee = get_markup_price(industry.base_rate, tier_wise_markup_list[str(location['tier'])])

        audit_fee = round((base_audit_price + tier_audit_fee) * float(audit_count))
        location['audit_fee'] = audit_fee
        total_audit_fee += audit_fee
        total_audit_count += int(audit_count)

    gst_amount = get_gst_amount(total_audit_fee, int(settings.CLIENT_QUOTATION_GST))
    payable_amount = total_audit_fee + gst_amount

    audit_volume_discount = find_audit_volume_discount(total_audit_count)
    audit_volume_discount_amount = 0
    if audit_volume_discount:
        audit_volume_discount_amount = round(get_markup_price(payable_amount, audit_volume_discount))
        payable_amount -= audit_volume_discount_amount

    result = {
        'industry': {
            'id': industry.id,
            'name': industry.name
        },
        'problem_statement': {
            'id': problem_statement.id,
            'name': problem_statement.name
        },
        'sample_questionnaire_type': {
            'id': sample_questionnaire_type.id,
            'name': sample_questionnaire_type.name
        },
        'audit_locations':audit_locations,
        'quotation_fee': total_audit_fee,
        'gst_amount': gst_amount,
        'gst': settings.CLIENT_QUOTATION_GST,
        'discount': audit_volume_discount_amount,
        'payable_amount': payable_amount
    }
    return result

# def get_industry_by_id(industry_id: int) -> dict:
#     industry_list = get_industry_list()
#     industry = {}
#     for ind in industry_list:
#         if int(ind['id']) == int(industry_id):
#             industry = ind
#             break
#     return industry

# def get_audit_type_by_id(audit_type_id) -> dict:
#     audit_type_list = get_audit_type_list()
#     audit_type = {}
#     for a_type in audit_type_list:
#         if a_type['id'] == int(audit_type_id):
#             audit_type = a_type
#             break
#     return audit_type

# def get_audit_category_by_id(audit_category_id) -> dict:
#     audit_category_list = get_audit_category_list()
#     audit_category = {}
#     for a_category in audit_category_list:
#         if a_category['id'] == int(audit_category_id):
#             audit_category = a_category
#             break
#     return audit_category

@atomic
def insert_quotation_data(client_id: int, quotation: dict) -> Quotation:
    industry_id = quotation['industry']
    problem_statement_id = quotation['problem_statement']
    sample_questionnaire_type_id = quotation['sample_questionnaire_type']
    audit_locations = quotation['audit_locations']
    amount = quotation['quotation_fee']
    payable_amount = quotation['payable_amount']
    discount = quotation['discount']
    gst = quotation['gst']
    quotation_data = {'auditor_profile': quotation['auditor_profile']}

    industry = questionnaire_service.get_industry_by_id(industry_id)
    problem_statement = questionnaire_service.get_problem_statement_by_id(problem_statement_id)
    sample_questionnaire_type = questionnaire_service.get_sample_questionnaire_type_by_id(sample_questionnaire_type_id)
    client = client_service.find_client_by_id(client_id)

    quotation_obj = Quotation.objects.create(industry=industry, problem_statement=problem_statement, sample_questionnaire_type=sample_questionnaire_type, amount=amount, payable_amount=payable_amount, gst=gst, discount=discount, status=Quotation.PENDING, client=client, quotation_data=quotation_data)

    for location in audit_locations:
        city = city_service.find_city_by_id(location['id'])
        audit_count = location['audit_count']
        audit_fee = location['audit_fee']
        loc_obj = AuditLocation(quotation=quotation_obj, city=city, count=audit_count, audit_fee=audit_fee)
        loc_obj.save()

    return quotation_obj

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


def find_uncomplete_by_client_id(client_id: int):
    try:
        quotation = Quotation.objects.get(client_id=client_id, status__in=Quotation._UNCOMPLETE_STATUS)
    except Quotation.DoesNotExist as e:
        raise AppLogicError('Quotation not found')
    return quotation