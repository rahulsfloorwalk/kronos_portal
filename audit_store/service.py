from datetime import timedelta
from typing import Optional

from django.db.transaction import atomic
from django.db.models import Count, Avg

from guardian.shortcuts import assign_perm, remove_perm, get_users_with_perms

from kronos.utils import today_ist

from .models import AuditStore, ReportFollowUpLog
from auditor.models import ProfileInfo
from audit.models import AuditCycle, Audit
from kronos.exceptions import ObjectNotFound, AppLogicError
import payment.service.payment_manager as payment_manager_service
import client.service.client_user as client_user_service
from manager.service import manager as manager_service
from audit.service import report_attribute_service
from registration.models import GROUP_NAME_AUDITOR


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
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.PM_REVIEW, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.AUDITOR_WITHDRAWN),
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


def find_by_audit_cycle_distinct_user(audit_cycle_id):
    return AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id).distinct('user__email') \
        .order_by('user__email').prefetch_related('user')


def find_by_audit_cycle_new(audit_cycle_id, last_audit_id, status, user_id, start_date, end_date,is_load_more,last_total_count):
    total_audit_count = 0
    if status != "" and last_audit_id != "":
        audit_list_obj = Audit.objects.filter(audit_cycle__id=audit_cycle_id, id__gt=last_audit_id, audit_stores__status=status) \
            .order_by('id', 'store__city__name', 'store__name','count') \
            .select_related('store__name', 'store__address', 'store__city__name') \
            .values('id', 'store__name', 'store__address', 'store__city__name','count')
    elif status != "":
        audit_list_obj = Audit.objects.filter(audit_cycle__id=audit_cycle_id, audit_stores__status=status).order_by('id', 'store__city__name', 'store__name') \
            .select_related('store__name', 'store__address', 'store__city__name') \
            .values('id', 'store__name', 'store__address', 'store__city__name','count') \
            .distinct('id')
        total_audit_count = audit_list_obj.count()
    elif last_audit_id != "":
        audit_list_obj = Audit.objects.filter(audit_cycle__id=audit_cycle_id, id__gt=last_audit_id).order_by('id', 'store__city__name', 'store__name') \
            .select_related('store__name', 'store__address', 'store__city__name') \
            .values('id', 'store__name', 'store__address', 'store__city__name','count')
    else:
        audit_list_obj = Audit.objects.filter(audit_cycle__id=audit_cycle_id).order_by('id', 'store__city__name', 'store__name') \
            .select_related('store__name', 'store__address', 'store__city__name') \
            .values('id', 'store__name', 'store__address', 'store__city__name','count')
        total_audit_count = audit_list_obj.count()
    if user_id != "":
        audit_list_obj = audit_list_obj.filter(audit_stores__user__id=user_id).distinct('id')
        total_audit_count = audit_list_obj.count()
    audit_list = audit_list_obj[0:100]
    if audit_list_obj.filter(count__gte=50):
        audit_list = audit_list_obj[0:2]
    if audit_list_obj.filter(count__gte=20):
        audit_list = audit_list_obj[0:5]
    if audit_list_obj.filter(count__gte=10):
        audit_list = audit_list_obj[0:10]
    if audit_list_obj.filter(count__gte=2):
        audit_list = audit_list_obj[0:50]
    audit_id_list = [audit['id'] for audit in audit_list]

    if start_date !="" and end_date !="":
        audit_store_obj = AuditStore.objects.filter(audit__id__in=audit_id_list, audit_date__range=[start_date, end_date]) \
            .values('id', 'status', 'auto_assigned','instant_assigned','audit_date','report_revert_count', 'audit__id', 'user__groups__name', 'user__email', 'user__id', 'user__profileinfo__first_name', 'user__profileinfo__last_name', 'user__profileinfo__mobile_number','user__profileinfo__certification_score', 'user__agencyuser__full_name', 'user__mobile_numbers__mobile_number', 'user__mobile_numbers__is_verified')
    else:
        audit_store_obj = AuditStore.objects.filter(audit__id__in=audit_id_list) \
            .values('id', 'status','auto_assigned','instant_assigned', 'audit_date','report_revert_count','audit__id', 'user__groups__name', 'user__email', 'user__id', 'user__profileinfo__first_name', 'user__profileinfo__last_name', 'user__profileinfo__mobile_number','user__profileinfo__certification_score', 'user__agencyuser__full_name', 'user__mobile_numbers__mobile_number', 'user__mobile_numbers__is_verified')
    if user_id != "":
        audit_store_obj = audit_store_obj.filter(user = user_id)
    if status != "":
        audit_store_obj = audit_store_obj.filter(status = status)
    audit_store_list = []
    for audit in audit_list:
        audit_store_dict = {}
        audit_report_list = []
        audit_store_dict['id'] = audit['id']
        audit_store_dict['store_name'] = audit['store__name']
        audit_store_dict['store_address'] = audit['store__address']
        audit_store_dict['store_city'] = audit['store__city__name']
        audit_store_dict['store_audit_count'] = audit['count']
        for audit_report in audit_store_obj:
            if audit_report['audit__id'] == audit['id']:
                audit_report_dict = {}
                audit_report_dict['id'] = audit_report['id']
                audit_report_dict['status'] = audit_report['status']
                audit_report_dict['auto_assigned'] = audit_report['auto_assigned']
                audit_report_dict['instant_assigned'] = audit_report['instant_assigned']
                audit_report_dict['audit_date'] = audit_report['audit_date']
                audit_report_dict['report_revert_count'] = audit_report['report_revert_count']
                audit_report_obj = AuditStore.objects.get(pk=audit_report['id'])
                users_with_perms = get_users_with_perms(audit_report_obj, attach_perms=True)
                moderator = [user.id for user, perms in users_with_perms.items() if "moderator_manage" in perms]
                audit_report_dict['assigned_to_moderator'] = moderator
                if audit_report['user__groups__name'] == GROUP_NAME_AUDITOR:
                    audit_report_dict['user'] = {
                                                 'id': audit_report['user__id'],
                                                 'email': audit_report['user__email'],
                                                 'profileinfo':
                                                     {
                                                         'first_name': audit_report['user__profileinfo__first_name'],
                                                         'last_name': audit_report['user__profileinfo__last_name'],
                                                         'mobile_number': audit_report['user__profileinfo__mobile_number'],
                                                         'certification_score': audit_report['user__profileinfo__certification_score']
                                                      },
                                                         'agencyuser': None,
                                                         'mobile_numbers': []
                                                }
                else:
                    audit_report_dict['user'] = {'id': audit_report['user__id'],
                                                 'email': audit_report['user__email'],
                                                 'agencyuser': {'full_name': audit_report['user__agencyuser__full_name']},
                                                 'profileinfo': None,
                                                 'mobile_numbers': [{
                                                     'mobile_number': audit_report['user__mobile_numbers__mobile_number'],
                                                     'is_verified': audit_report['user__mobile_numbers__is_verified']
                                                 }]
                                                 }
                audit_report_list.append(audit_report_dict)
        audit_store_dict['reports'] = audit_report_list
        audit_store_list.append(audit_store_dict)
        if is_load_more:
            start  = int(last_total_count)
            end = int(last_total_count) + 20
            audit_store_list_obj_slice = audit_store_list[start:end]
        else:
            audit_store_list_obj_slice = audit_store_list[0:20]
    return {'audit_store_list': audit_store_list_obj_slice, 'total_audit_count': total_audit_count}


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
        # audit_date=today_ist(),
        audit_date=today_ist() - timedelta(days=1),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
    )


def find_for_post_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist() - timedelta(days=1),
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
    )


def set_report_attribute_value(audit_store_id, report_attribute_json_id, report_attribute_option_id):
    audit_store = find_by_id(audit_store_id)
    report_attribute = report_attribute_service.find_report_attribute_by_audit_cycle_id_and_json_id(audit_store.audit.audit_cycle.id, report_attribute_json_id)

    if report_attribute.option_exists(report_attribute_option_id):
        audit_store.set_attribute_data(report_attribute.json_id, report_attribute_option_id)
        return audit_store
    else:
        raise AppLogicError("invalid report_attribute option id")

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
        if audit_store.status not in (AuditStore.SUBMITTED, AuditStore.PM_REVIEW, AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED):
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


def accept_all_audit_stores(audit_cycle_id, user_actor, start_date, end_date):
    if start_date != "" and end_date != "":
        completed_audit_stores = find_by_audit_cycle(audit_cycle_id).filter(status=AuditStore.COMPLETED, audit_date__range = [start_date, end_date])
    else:
        completed_audit_stores = find_by_audit_cycle(audit_cycle_id).filter(status=AuditStore.COMPLETED)

    for audit_store in completed_audit_stores:
        accept(audit_store.id, user_actor)

    return len(completed_audit_stores)


def set_moderator_status(audit_store_id, moderator_status):
    audit_store = find_by_id(audit_store_id)
    audit_store.set_moderator_status(moderator_status)
    return audit_store


def set_moderator_comment(audit_store_id, moderator_comment):
    audit_store = find_by_id(audit_store_id)
    if len(moderator_comment) > 2999:
        raise AppLogicError("Comment should not be greater than 3000 character")
    audit_store.set_moderator_comment(moderator_comment)
    return audit_store


def set_check_points(audit_store_id, check_points):
    audit_store = find_by_id(audit_store_id)
    db_check_points = audit_store.check_points
    for i in db_check_points:
        if i in check_points:
            db_check_points[i]['value'] = True
        else:
            db_check_points[i]['value'] = False
    audit_store.set_check_points(db_check_points)
    return audit_store


def find_7_days_assigned_reports():
    return AuditStore.objects.filter(audit_date__lte=today_ist() - timedelta(days=7),
                                     audit__audit_cycle__status=AuditCycle.ACTIVE,
                                     status=AuditStore.ASSIGNED)


def find_10_days_in_progress_reports():
    return AuditStore.objects.filter(audit_date__lte=today_ist() - timedelta(days=10),
                                     audit__audit_cycle__status=AuditCycle.ACTIVE,
                                     status=AuditStore.ACKNOWLEDGED)


def find_2_days_not_submitted_reports():
    return AuditStore.objects.filter(audit_date__lte=today_ist() - timedelta(days=3),
                                     audit__audit_cycle__status=AuditCycle.ACTIVE,
                                     status__in = [AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED])

def get_follow_up_by_audit_store(audit_store_id: int):
    follow_up = ReportFollowUpLog.objects.filter(audit_store_id = audit_store_id).first()

    if follow_up:
        return follow_up
    else:
        raise AppLogicError("Follow up not found")


@atomic
def set_follow_up_by_audit_store(audit_store_id: int, comment: str, next_follow_up_date: Optional[str], user_id: int):
    if not comment:
        raise AppLogicError("Please enter a comment")

    audit_store = find_by_id(audit_store_id)
    manager = manager_service.find_by_id(user_id)
    try:
        follow_up = get_follow_up_by_audit_store(audit_store.id)
    except Exception as e:
        follow_up = None

    if follow_up:
        follow_up.comment = comment
        follow_up.next_follow_up_date = next_follow_up_date if next_follow_up_date else follow_up.next_follow_up_date
        follow_up.user_actor = manager
        follow_up.save()
        return follow_up
    else:
        follow_up = ReportFollowUpLog()
        follow_up.user_actor = manager
        follow_up.audit_store = audit_store
        follow_up.comment = comment
        follow_up.next_follow_up_date=next_follow_up_date if next_follow_up_date else None
        follow_up.save()
        return follow_up