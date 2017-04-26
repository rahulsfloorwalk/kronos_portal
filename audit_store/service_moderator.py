from django.db.transaction import atomic

from django.contrib.auth.models import User, Group

from notifications.signals import notify

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from registration.service.moderator import find_moderator_by_user_id

from .models import AuditStore
import audit.service.audit_cycle as audit_cycle_service
from . import service as audit_store_service


def find_by_audit_cycle_for_moderator(audit_cycle_id, user_id):
    audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, user_id)
    return AuditStore.objects.filter(audit__audit_cycle__id=audit_cycle.id, status__in=[AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED]).order_by('-audit_date')


def find_by_id_for_moderator(audit_store_id, user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        audit_store = AuditStore.objects.get(pk=audit_store_id, status__in=[AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED])
        if user.has_perm('moderator_manage', audit_store.audit.audit_cycle):
            return audit_store
        else:
            raise ObjectNotFound
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def complete_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.complete(audit_store.id, user)


@atomic
def fail_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.fail(audit_store.id, user)


@atomic
def submit_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.submit_by_manager(audit_store.id, user)


@atomic
def set_audit_date_for_moderator(audit_store_id, audit_date, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.set_audit_date(audit_store.id, audit_date)



@atomic
def unsubmit_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.unsubmit(audit_store.id, user)
