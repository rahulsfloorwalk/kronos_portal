from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError
from django.db.transaction import atomic

@atomic
def change_password(user_id, old_password, new_password):
    user = User.objects.get(pk=user_id)
    if not user.check_password(old_password):
        raise AppLogicError("Old password is incorrect")
    user.set_password(new_password)
    user.save()
    return {'detail': 'Password changed'}
