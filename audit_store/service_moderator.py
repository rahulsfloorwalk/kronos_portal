from django.db.transaction import atomic
from guardian.shortcuts import get_objects_for_user

from kronos.exceptions import ObjectNotFound

from registration.service.moderator import find_moderator_by_user_id

from audit.models import AuditCycle
from audit_store.models import AuditStore
import audit.service.audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service


def find_completed_audit_stores_for_moderator(user_id):
    user = find_moderator_by_user_id(user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__status__in=(AuditCycle.ACTIVE, AuditCycle.REPORT),
        status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED)
    ).order_by('audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)

def find_pending_audit_stores_for_moderator(user_id):
    user = find_moderator_by_user_id(user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__status__in=(AuditCycle.ACTIVE, AuditCycle.REPORT),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED)
    ).order_by('audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)


def find_by_audit_cycle_for_moderator(audit_cycle_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__id=audit_cycle.id,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED)
    ).order_by('-audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)


def find_by_id_for_moderator(audit_store_id, user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        audit_store = AuditStore.objects.get(pk=audit_store_id, status__in=[AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED])
        if user.has_perm('moderator_manage', audit_store):
            return audit_store
        else:
            raise ObjectNotFound
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


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
    audit_store = find_by_id_for_moderator(audit_store_id, user.id)
    return audit_store_service.set_audit_date(audit_store.id, audit_date)


@atomic
def unsubmit_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return audit_store_service.unsubmit(audit_store.id, user)
