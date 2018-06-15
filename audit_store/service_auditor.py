from django.contrib.auth.models import User
from django.db.transaction import atomic
from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore


@atomic
def acknowledge_report(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        user = User.objects.get(pk=user_id)
        if user != audit_store.user:
            raise AppLogicError("Report cannot be acknowledged by user")

        audit_store.acknowledge(by=user)
        return audit_store

    except (AuditStore.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound() from e


@atomic
def submit_report(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        user = User.objects.get(pk=user_id)
        if user != audit_store.user:
            raise AppLogicError("Report cannot be submitted by user")

        audit_store.submit(by=user)
        return audit_store

    except (AuditStore.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound() from e

