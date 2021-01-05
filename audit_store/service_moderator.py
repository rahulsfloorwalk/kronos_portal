from django.db.transaction import atomic
from guardian.shortcuts import get_objects_for_user, get_users_with_perms

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.service.moderator import find_moderator_by_user_id

from audit.models import AuditCycle
from audit_store.models import AuditStore
import audit.service.audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from attachment.service import set_attachment_by_proof_tag


def find_qa_completed_audit_stores_for_moderator(user_id, lastAuditStoreDate):
    # TODO: move this in to the AuditStoreQuerySet
    count = 0
    user = find_moderator_by_user_id(user_id)
    if lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW),
            audit_date__gte=lastAuditStoreDate
        ).order_by('audit_date')
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    else:
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW)
        ).order_by('audit_date')
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    return data[0:100], count


def find_qa_pending_audit_stores_for_moderator(user_id, lastAuditStoreDate):
    # TODO: move this in to the AuditStoreQuerySet
    count = 0
    user = find_moderator_by_user_id(user_id)
    if lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            audit_date__gte=lastAuditStoreDate
        ).order_by('audit_date')
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    else:
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED)
        ).order_by('audit_date', 'id')
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    return data[0:100], count


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
        audit_store = AuditStore.objects.get(
            pk=audit_store_id,
            status__in=[
                AuditStore.ASSIGNED,
                AuditStore.ACKNOWLEDGED,
                AuditStore.SUBMITTED,
                AuditStore.PM_REVIEW,
                AuditStore.FAILED,
                AuditStore.COMPLETED,
                AuditStore.ACCEPTED,
                AuditStore.REJECTED,
            ]
        )
        if user.has_perm('moderator_manage', audit_store):
            return audit_store
        else:
            raise ObjectNotFound
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def fail_for_moderator(audit_store_id, user_id, message):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    audit_store.fail(by=user, message=message)
    return audit_store


@atomic
def submit_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    set_attachment_by_proof_tag(audit_store_id)
    audit_store.submit(by=user)
    return audit_store


@atomic
def set_audit_date_for_moderator(audit_store_id, audit_date, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user.id)
    return audit_store_service.set_audit_date(audit_store.id, audit_date)

@atomic
def unsubmit_for_moderator(audit_store_id, user_id, message):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    audit_store.revert_submit(by=user, message=message)
    return audit_store

def set_reimbursement_for_moderator(audit_store_id, reimbursement, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    if audit_store.is_editable_by_moderator():
        audit_store.set_reimbursement(reimbursement)
        return audit_store
    else:
        raise AppLogicError("cannot set reimbursement now")

def set_earnings_per_audit_for_moderator(audit_store_id, earnings_per_audit, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    if audit_store.is_editable_by_moderator():
        audit_store.set_earnings_per_audit(earnings_per_audit)
        return audit_store
    else:
        raise AppLogicError("cannot set earnings per audit now")

def set_report_summary(audit_store_id, report_summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary(report_summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")

def set_moderator_status(audit_store_id, moderator_status, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id,user_id)
    audit_store.set_moderator_status(moderator_status)
    return audit_store

def set_moderator_comment(audit_store_id, moderator_comment, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if len(moderator_comment) > 2999:
        raise AppLogicError("Comment should not be greater than 3000 character")
    audit_store.set_moderator_comment(moderator_comment)
    return audit_store

def set_check_points(audit_store_id, check_points, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    db_check_points = audit_store.check_points
    for i in db_check_points:
        if i in check_points:
            db_check_points[i]['value'] = True
        else:
            db_check_points[i]['value'] = False
    audit_store.set_check_points(db_check_points)
    return audit_store


def get_moderator_email_by_audit_store_obj(audit_store):
    users_with_perms = get_users_with_perms(audit_store, attach_perms=True)
    for user, perms in users_with_perms.items():
        if 'moderator_manage' in perms:
            return user.email
    return None
