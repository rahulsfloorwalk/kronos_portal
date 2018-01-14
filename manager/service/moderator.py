from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm, get_users_with_perms, remove_perm

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit.models import AuditCycle
from registration.models import GROUP_NAME_MODERATOR

def find_all():
    return Group.objects.get(name=GROUP_NAME_MODERATOR).user_set

def find_by_id(user_id):
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
        user.groups.add(Group.objects.get(name=GROUP_NAME_MODERATOR))
        user.save()

        return user
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


@atomic
def update(user_id, email, password="", is_active=True):
    try:
        user = Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)

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


def find_by_audit_cycle(audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        return get_users_with_perms(audit_cycle)
    except (Group.DoesNotExist, User.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e


@atomic
def assign_audit_cycle(user_id, audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        user = Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)

        assign_perm('moderator_manage', user, audit_cycle)

        return user
    except (Group.DoesNotExist, User.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e

@atomic
def revoke_audit_cycle(user_id, audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        user = Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)

        remove_perm('moderator_manage', user, audit_cycle)

        return user
    except (Group.DoesNotExist, User.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e
