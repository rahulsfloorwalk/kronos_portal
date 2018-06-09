from django.db import connection
from django.db.transaction import atomic
from django.contrib.auth.models import User, Group

from notifications.signals import notify
from notifications.models import Notification

from registration.models import GROUP_NAME_MANAGER
from notify.service import mail_notify

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from notify import verbs


@atomic
def fiat_assign(audit_id, email, audit_date, user_actor):
    try:
        user = User.objects.get(email__iexact=email)
        audit = Audit.objects.get(pk=audit_id)
        audit_cycle = audit.audit_cycle
    except (Audit.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e
    except (User.DoesNotExist) as e:
        raise AppLogicError("email is not valid") from e

    if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
        raise AppLogicError("audit date is out of range")
    if audit_cycle.status == AuditCycle.ARCHIVED:
        raise AppLogicError("audit_cycle is archived")

    audit_store = AuditStore.objects.assign_audit_store(audit, audit_date, user, user_actor)
    return audit_store

def get_latest_audit_cycle_for_client(client_id, audit_cycle_type):
    if audit_cycle_type is None:
        try:
            return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
    else:
        try:
            return AuditCycle.objects.filter(client_id=client_id, type=audit_cycle_type).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
