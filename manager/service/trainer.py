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
    audits = Audit.objects.filter(client_trainer__isnull=False
                ).values(
                    "id",
                    "client_trainer__user_id",
                    "client_trainer__user__email",
                    "client_trainer__user__trainerprofileinfo__name",
                    "audit_stores__id",
                    "audit_stores__status"
                )

    data = defaultdict(lambda: {
        "trainer_id": None,
        "email": None,
        "name": None,

        "total_audit_count": 0,
        "total_report_count": 0,

        "reports": {
            "assigned": 0,
            "acknowledged": 0,
            "submitted": 0,
            "pm_review": 0,
            "completed": 0,
            "accepted": 0
        }
    })

    counted_audits = set()
    counted_reports = set()

    for audit in audits:
        trainer_id = audit["client_trainer__user_id"]
        data[trainer_id]["trainer_id"] = trainer_id
        data[trainer_id]["email"] = audit["client_trainer__user__email"]
        data[trainer_id]["name"] = audit["client_trainer__user__trainerprofileinfo__name"]

        audit_key = (trainer_id, audit["id"])

        if audit_key not in counted_audits:
            data[trainer_id]["total_audit_count"] += 1
            counted_audits.add(audit_key)

        audit_store_id = audit["audit_stores__id"]
        report_key = (trainer_id, audit_store_id)

        if audit_store_id and report_key not in counted_reports:
            data[trainer_id]["total_report_count"] += 1
            counted_reports.add(report_key)

            status = audit["audit_stores__status"]

            if status == "ASSIGNED":
                data[trainer_id]["reports"]["assigned"] += 1

            elif status == "ACKNOWLEDGED":
                data[trainer_id]["reports"]["acknowledged"] += 1

            elif status == "SUBMITTED":
                data[trainer_id]["reports"]["submitted"] += 1

            elif status == "PM_REVIEW":
                data[trainer_id]["reports"]["pm_review"] += 1

            elif status == "COMPLETED":
                data[trainer_id]["reports"]["completed"] += 1

            elif status == "ACCEPTED":
                data[trainer_id]["reports"]["accepted"] += 1

    return list(data.values())