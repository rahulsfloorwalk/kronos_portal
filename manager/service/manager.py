from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER,GROUP_NAME_MODERATOR

def find_all():
    return Group.objects.get(name=GROUP_NAME_MANAGER).user_set

def find_by_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_MANAGER).user_set.get(pk=user_id)
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
    
def moderator_find_by_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)
    except User.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def insert(email, password, is_active=True):
    try:
        if password == "":
            raise AppLogicError("password cannot be blank")

        user = User()
        user.email = email
        user.username = email
        user.set_password(password)
        user.is_active = is_active
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_MANAGER))
        user.save()

        return user
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


@atomic
def update(user_id, email, password="", is_active=True):
    try:
        user = Group.objects.get(name=GROUP_NAME_MANAGER).user_set.get(pk=user_id)

        user.email = email
        user.username = email
        user.is_active = is_active

        if password != "":
            user.set_password(password)

        user.save()

        return user
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e

