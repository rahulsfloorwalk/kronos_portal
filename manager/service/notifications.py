from django.contrib.auth.models import User

from notifications.models import Notification

from kronos.exceptions import ObjectNotFound, AppLogicError

from manager.notification import verbs


def find_by_recipient_user_and_verb(user_id, verb=None, before=None):
    try:
        user = User.objects.get(pk=user_id)

        qs = user.notifications

        if verb not in (None, ""):
            if verb not in verbs:
                raise AppLogicError("invalid verb")
            else:
                qs = qs.filter(verb=verb)

        if before not in (None, ""):
            qs = qs.filter(timestamp__lt=before)

        return qs.all()[:10]
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
