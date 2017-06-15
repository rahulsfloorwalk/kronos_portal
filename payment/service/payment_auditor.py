from payment.models import Payment

def find_by_user(user_id):
    return Payment.objects.filter(user_id=user_id)
