from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

def deactivate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = False
        user.save()
        return user
    else:
        raise ObjectNotFound

def activate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = True
        user.save()
        return user
    else:
        raise ObjectNotFound

def verify_auditor(user_id):
    try:
        user = User.objects.get(pk=user_id)
        if user.groups.filter(name=GROUP_NAME_AUDITOR).exists() and not user.verification.is_verified:
            user.verification.is_verified = True
            user.verification.save()
            return user
        else:
            raise ObjectNotFound
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
