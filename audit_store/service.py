from datetime import timedelta

from django.db.transaction import atomic
from django.db.models import Count, Avg

from guardian.shortcuts import assign_perm, remove_perm

from kronos.utils import today_ist

from .models import AuditStore
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound, AppLogicError
import payment.service.payment_manager as payment_manager_service
import client.service.client_user as client_user_service

def find_by_id(audit_store_id):
    try:
        return AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def find_audit_stores_for_auditor(profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.filter(
            user_id=profile_info.user_id,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.PM_REVIEW, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED),
            audit__audit_cycle__status__in=AuditCycle.AUDITOR_VISIBLE_STATUSES
        ).order_by('-audit_date')
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def average_rating_for_auditor(user_id):
    return AuditStore.objects.filter(
        user_id=user_id,
        status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED),
    ).aggregate(Avg('qa_rating'))["qa_rating__avg"]

def find_by_audit(audit_id):
    return AuditStore.objects.filter(audit_id=audit_id).prefetch_related(
        'user',
        'user__profileinfo',
    )

def find_by_audit_cycle(audit_cycle_id):
    return AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id).prefetch_related(
        'user',
        'user__profileinfo',
    )

def find_by_id_for_auditor(audit_store_id, user_id):
    try:
        return AuditStore.objects.get(
            pk=audit_store_id,
            user_id=user_id,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.PM_REVIEW, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED),
            audit__audit_cycle__status__in=AuditCycle.AUDITOR_VISIBLE_STATUSES
        )
    except (AuditStore.DoesNotExist) as e:
        raise ObjectNotFound from e


def find_latest_for_client(client_id):
    return AuditStore.objects.presentable().filter(audit__audit_cycle__client_id=client_id)[:5]


def find_by_store_for_client(store_id, client_id):
    return AuditStore.objects.presentable().filter(
        audit__audit_cycle__client_id=client_id,
        audit__store_id=store_id,
    ).prefetch_related(
        'report_sections',
        'report_sections__section',
        'report_sections__section__questions',
        'report_sections__section__questions__answers',
        'audit',
        'audit__store',
        'audit__store__city',
        'audit__audit_cycle',
        'audit__audit_cycle__client',
        'audit__audit_cycle__sections',
    )


def find_for_pre_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist() + timedelta(days=1),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
    )

def find_for_on_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist(),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
    )

def find_for_post_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist() - timedelta(days=1),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
    )


def save(audit_store):
    AuditStore.save(audit_store)
    return audit_store

@atomic
def withdraw(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.withdraw(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def acknowledge(audit_store_id, user_id):
    try:
        audit_store = find_by_id_for_auditor(audit_store_id, user_id)
        audit_store.acknowledge(by=audit_store.user)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def submit(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id, user_id=user_id)
        audit_store.submit(by=audit_store.user)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def complete(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.complete(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def fail(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.fail(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def submit_by_manager(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.submit_manager(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def set_audit_date(audit_store_id, audit_date):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit = audit_store.audit

        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise AppLogicError("audit date is out of range")
        if audit_store.status not in (AuditStore.SUBMITTED, AuditStore.PM_REVIEW):
            raise AppLogicError("audit date cannot be set right now")

        audit_store.audit_date = audit_date
        audit_store.save()
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def unsubmit(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.revert_submit(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def uncomplete(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.revert_complete(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def accept(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.accept(by=user_actor)
        earnings_per_audit = audit_store.earnings_per_audit or audit_store.audit.earnings_per_audit or 0
        reimbursement = audit_store.reimbursement or audit_store.audit.reimbursement or 0
        payment_amount = earnings_per_audit + reimbursement
        # add the entry to the payment row
        payment_manager_service.add_payment_on_audit_store_accepted(audit_store.id, payment_amount, user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def reject(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit_store.reject(by=user_actor)
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def assign_audit_store_to_client_user(audit_store_id, user_id):
    audit_store = find_by_id(audit_store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == audit_store.audit.audit_cycle.client.id:
        raise AppLogicError("cannot assign AuditStore across client boundries")

    assign_perm('clientuser_visible', user, audit_store)
    return audit_store

@atomic
def revoke_audit_store_from_client_user(audit_store_id, user_id):
    audit_store = find_by_id(audit_store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == audit_store.audit.audit_cycle.client.id:
        raise AppLogicError("cannot revoke AuditStore across client boundries")

    remove_perm('clientuser_visible', user, audit_store)
    return audit_store


def get_audit_store_stats(audit_cycle_id):
    return AuditStore.objects.filter(audit__audit_cycle__id=audit_cycle_id).values('status').annotate(count=Count('status'))


@atomic
def accept_all_audit_stores(audit_cycle_id, user_actor):
    completed_audit_stores = find_by_audit_cycle(audit_cycle_id).filter(status=AuditStore.COMPLETED)

    for audit_store in completed_audit_stores:
        accept(audit_store.id, user_actor)

    return len(completed_audit_stores)
