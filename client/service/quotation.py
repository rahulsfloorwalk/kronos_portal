from client.models import Quotation
from kronos.exceptions import AppLogicError

def find_by_id(quotation_id):
    try:
        quotation = Quotation.objects.get(id=quotation_id)
    except Quotation.DoesNotExist as e:
        raise AppLogicError('Quotation not found')

    return quotation