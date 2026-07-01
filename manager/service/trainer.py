from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_TRAINER
from manager.models import TrainerProfileInfo
from audit_store.models import Audit
from collections import defaultdict

def find_all():
    return Group.objects.get(name=GROUP_NAME_TRAINER).user_set

def find_by_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_TRAINER).user_set.get(pk=user_id)
    except User.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def insert(email, password, is_active=True, name=None,mobile=None,firm_name=None):
    try:
        if password == "":
            raise AppLogicError("password cannot be blank")

        user = User()
        user.email = email
        user.username = email
        user.set_password(password)
        user.is_active = is_active
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_TRAINER))

        TrainerProfileInfo.objects.create(
            user=user,
            name=name,
            mobile=mobile,
            firm_name=firm_name
        )
        user.save()

        return user
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


@atomic
def update(user_id, email, password="", is_active=True, name=None,mobile=None,firm_name=None):
    try:
        user = Group.objects.get(name=GROUP_NAME_TRAINER).user_set.get(pk=user_id)

        user.email = email
        user.username = email
        user.is_active = is_active

        if password != "":
            user.set_password(password)

        TrainerProfileInfo.objects.update_or_create(
            user=user,
            defaults={
                "name": name,
                "mobile": mobile,
                "firm_name": firm_name,
            }
        )
        user.save()

        return user
    except User.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


def trainer_summary_global():
    audits = Audit.objects.filter(trainer__isnull=False).values("trainer__user_id","audit_cycle__status")
    data = defaultdict(lambda: {"total": 0})

    for audit in audits:
        user_id = audit["trainer__user_id"]
        status = audit["audit_cycle__status"]

        data[user_id]["total"] += 1
        data[user_id][status] = data[user_id].get(status, 0) + 1

    return dict(data)