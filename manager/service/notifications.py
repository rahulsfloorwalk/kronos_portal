from django.contrib.auth.models import User

from notifications.models import Notification

from kronos.exceptions import ObjectNotFound, AppLogicError


def find_by_recipient_user(user_id, before=None):
    try:
        user = User.objects.get(pk=user_id)
        if before is None:
            return user.notifications.all()[:10]
        else:
            return user.notifications.filter(timestamp__lt=before)[:10]
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
