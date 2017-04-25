from django.db.transaction import atomic

from django.contrib.auth.models import User, Group

from notifications.signals import notify

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR

from .models import AuditStore
from audit.models import AuditCycle


def get_moderator(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_MODERATOR).user_set.get(pk=user_id)
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e

def find_by_audit_cycle_for_moderator(audit_cycle_id, user_id):
    try:
        u = get_moderator(user_id)
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id, status__in=[AuditCycle.ACTIVE, AuditCycle.REPORT])
        return AuditStore.objects.filter(audit__audit_cycle__id=audit_cycle_id, status__in=[AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED]).order_by('-audit_date')
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


def find_by_id_for_moderator(audit_store_id, user_id):
    try:
        user = get_moderator(user_id)
        return AuditStore.objects.get(pk=audit_store_id, status__in=[AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED])
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def complete_for_moderator(audit_store_id, user_id):
    try:
        user = get_moderator(user_id)

        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.COMPLETED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_COMPLETED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user,
                recipient=audit_store.user,
                verb='AUDIT_STORE_COMPLETED',
                action_object=audit_store,
                target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be completed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def fail_for_moderator(audit_store_id, user_id):
    try:
        user = get_moderator(user_id)
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status in (AuditStore.SUBMITTED, AuditStore.ASSIGNED):
            audit_store.status = AuditStore.FAILED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_FAILED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user,
                recipient=audit_store.user,
                verb='AUDIT_STORE_FAILED',
                action_object=audit_store,
                target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be failed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def submit_for_moderator(audit_store_id, user_id):
    try:
        user = get_moderator(user_id)
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.ASSIGNED:
            audit_store.status = AuditStore.SUBMITTED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_SUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user,
                recipient=audit_store.user,
                verb='AUDIT_STORE_SUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be unsubmitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def set_audit_date_for_moderator(audit_store_id, audit_date, user_id):
    try:
        user = get_moderator(user_id)

        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit = audit_store.audit

        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise AppLogicError("audit date is out of range")
        if audit_store.status != AuditStore.SUBMITTED:
            raise AppLogicError("application cannot be approved right now")

        audit_store.audit_date = audit_date
        audit_store.save()
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def unsubmit_for_moderator(audit_store_id, user_id):
    try:
        user = get_moderator(user_id)

        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.ASSIGNED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_UNSUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_UNSUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user,
                recipient=audit_store.user,
                verb='AUDIT_STORE_UNSUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be unsubmitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
