from django.contrib.auth.models import User
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

def deactivate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = False
        user.save()
        return ProfileInfo.objects.get(user=user)
    else:
        raise NotFound

def activate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = True
        user.save()
        return ProfileInfo.objects.get(user=user)
    else:
        raise NotFound
