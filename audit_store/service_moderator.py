from django.db.transaction import atomic
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from audit.service.audit_cycle_proof_tag import get_audit_cycle_proof_tag_for_attachment

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.service.moderator import find_moderator_by_user_id,find_auditor_by_user_id

from audit.models import AuditCycle
from audit_store.models import AuditStore
import audit.service.audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from attachment.service import set_attachment_by_audit_store, set_attachment_by_proof_tag
from audit.models import Audit
from client.models import Store
from datetime import date, timedelta

def find_qa_completed_audit_stores_for_moderator(user_id, lastAuditStoreDate, filterStatus, client_id):
    # TODO: move this in to the AuditStoreQuerySet
    count = 0
    user = find_moderator_by_user_id(user_id)
    if filterStatus != "" and lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus,
            audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    elif filterStatus != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    elif lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW),
            audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    else:
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW)
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    return data[0:200], count


def find_qa_pending_audit_stores_for_moderator(user_id, lastAuditStoreDate, filterStatus, client_id):
    # TODO: move this in to the AuditStoreQuerySet
    count = 0
    user = find_moderator_by_user_id(user_id)
    today = date.today()
    if filterStatus == "CRITICAL_REPORT":
        four_days_ago = today - timedelta(days=4)
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            audit_date__lte=four_days_ago
        ).prefetch_related(
            'audit', 'audit__audit_cycle', 'audit__audit_cycle__client',
            'audit__store', 'audit__store__city'
        ).order_by('audit_date')

        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client=client_id)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    elif filterStatus == "REVERTED_REPORT":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            report_revert_count__gt=0
        ).prefetch_related(
            'audit', 'audit__audit_cycle', 'audit__audit_cycle__client',
            'audit__store', 'audit__store__city'
        ).order_by('audit_date')

        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client=client_id)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    elif filterStatus != "" and lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus, audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    elif filterStatus != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    elif lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    else:
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED)
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    return data[0:200], count


def find_by_audit_cycle_for_moderator(audit_cycle_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__id=audit_cycle.id,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED)
    ).order_by('-audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)


def find_stores_by_client(client_id):
    return Store.objects.filter(client_id=client_id).order_by('city__name').select_related('client','city')

def find_audit_by_id(audit_id):
    try:
        return Audit.objects.get(pk=audit_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e
    
def create_audit_by_store(data):
    audit_cycle_id = data.get('audit_cycle')
    store_id = data.get('store')
    if not store_id:
        raise AppLogicError("Please Choose at any One Store")
    if not audit_cycle_id:
        raise AppLogicError("Audit cycle is required.")

    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    store_exists = Store.objects.filter(client=audit_cycle.client.id, id=store_id).exists()
    if not store_exists:
        raise AppLogicError("The specified store does not exist for this client.")
    store_exists = Store.objects.filter(client = audit_cycle.client.id).exists()
    if not store_exists:
        raise AppLogicError("Stores are not found in This Client")
    
    audit_data = {
        'count': data.get('count', 1),
        'earnings_per_audit': data.get('earnings_per_audit', audit_cycle.earnings_per_audit),
        'reimbursement': data.get('reimbursement', audit_cycle.reimbursement),
        'store_id': store_id,
        'audit_cycle': audit_cycle,
        'post_approval_description': data.get('post_approval_description', '')
    }
    audit = Audit.objects.create(**audit_data)
    return audit
    
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
    
def find_by_id_for_auditor(audit_store_id, user_id):
    try:
        user = find_auditor_by_user_id(user_id)
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
        if audit_store:
            return audit_store
        # if user.has_perm('moderator_manage', audit_store):
        #     return audit_store
        # else:
        #     raise ObjectNotFound
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
def unsubmit_for_moderator(audit_store_id, user_id, message, missing_proofs=[]):
    audit_store=AuditStore.objects.get(id=audit_store_id)
    audit_store.report_revert_count+=1
    audit_store.save()
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    missing_proof_names = []
    if missing_proofs:
        proof_tag_list = get_audit_cycle_proof_tag_for_attachment(audit_store.audit.audit_cycle.id)
        for proof in proof_tag_list:
            if proof['id'] in missing_proofs:
                missing_proof_names.append(proof['proof_tag'])

    audit_store.revert_submit(by=user, message=message, proof_tags=missing_proof_names)
    set_attachment_by_audit_store(audit_store_id)
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

def set_back_to_original_report_summary(audit_store_id,summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary_back_to_original(summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")

def set_report_summary_updated(audit_store_id, report_summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary_updated(report_summary)
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
