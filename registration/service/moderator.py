from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_MODERATOR

def find_moderator_by_user_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e
