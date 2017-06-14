from payment.models import Payment

def get_payments_by_user_id(user_id):
    return Payment.objects.filter(user_id=user_id)
