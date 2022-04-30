from billing.models import Payment
from kronos.exceptions import AppLogicError

def get_by_id(payment_id: int) -> Payment:
    """Find payment object by id"""
    try:
        payment = Payment.objects.get(id = payment_id)
    except Payment.DoesNotExist as e:
        raise AppLogicError('Payment not found')

    return payment