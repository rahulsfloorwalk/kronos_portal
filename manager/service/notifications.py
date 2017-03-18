from django.contrib.auth.models import User

from notifications.models import Notification

from kronos.exceptions import ObjectNotFound, AppLogicError


def find_by_user(user_id):
    try:
        user = User.objects.get(pk=user_id)
        return user.notifications.all()[:20]
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
