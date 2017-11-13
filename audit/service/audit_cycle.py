from django.contrib.auth.models import User
from django.db.models import Q

from guardian.shortcuts import get_objects_for_user

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_CLIENT, GROUP_NAME_MODERATOR

from registration.service.moderator import find_moderator_by_user_id
from client.service.client_user import find_clientuser_by_user_id

from ..models import AuditCycle
from auditor.models import AuditApplication
from audit_store.models import AuditStore

def save(audit):
    AuditCycle.save(audit)
    return audit

def find_distinct_types_for_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditCycle.objects.filter(
            client_id=user.clientuser.client_id,
            status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.ARCHIVED)
    ).distinct('type').values_list('type', flat=True)

def find_for_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditStore.objects.presentable().visible_to(user).filter(
            audit__audit_cycle__client__id=user.clientuser.client_id,
    ).distinct('audit__audit_cycle_id').order_by('-audit__audit_cycle_id').values(
            'audit__audit_cycle__id',
            'audit__audit_cycle__name',
            'audit__audit_cycle__start_date',
            'audit__audit_cycle__end_date',
            'audit__audit_cycle__type',
    )


def find_by_id_for_clientuser(audit_cycle_id, user_id):
    try:
        user = find_clientuser_by_user_id(user_id)
        return AuditCycle.objects.get(client_id=user.clientuser.client_id, status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.ARCHIVED), pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit_type_for_clientuser(audit_type, user_id):
    if audit_type not in [t[0] for t in AuditCycle.TYPES]:
        raise AppLogicError("Invalid Audit Type")
    try:
        user = find_clientuser_by_user_id(user_id)
        return AuditCycle.objects.filter(client_id=user.clientuser.client_id, status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.ARCHIVED), type=audit_type).order_by('-end_date')
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

def get_audit_cycle_stats(audit_cycle_id):

    audits = AuditCycle.objects.get(pk=audit_cycle_id).audits.all()
    applications = []
    stores = []
    for audit in audits:
        applications.extend(audit.applications.all())
        stores.extend(audit.audit_stores.all())

    result = {}
    result['application'] = {}
    result['audit_store'] = {}
    for application in applications:
        if result.get('application').get(application.status):
            result.get('application')[application.status] += 1
        else:
            result.get('application')[application.status] = 1
    for store in stores:
        if result.get('audit_store').get(store.status):
            result.get('audit_store')[store.status] += 1
        else:
            result.get('audit_store')[store.status] = 1
    for key in AuditApplication.STATUS:
        if not result.get('application').get(key[0]):
            result.get('application')[key[0]] = 0
    for key in AuditStore.STATUS:
        if not result.get('audit_store').get(key[0]):
            result.get('audit_store')[key[0]] = 0
    return result

def get_audit_cycle_dashboard():
    auditCycles = AuditCycle.objects.filter(
            Q(status = AuditCycle.UPCOMING) | Q(status = AuditCycle.ACTIVE) | Q(status = AuditCycle.REPORT)
        ).all().order_by('end_date')
    return auditCycles

def find_for_moderator(user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        query_set = AuditCycle.objects.filter(status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.UPCOMING)).order_by('-end_date')
        return get_objects_for_user(user, 'moderator_manage', klass=query_set)
    except (User.DoesNotExist, ) as e:
        raise ObjectNotFound from e


def find_by_id_for_moderator(audit_cycle_id, user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id, status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.UPCOMING))

        if user.has_perm('moderator_manage', audit_cycle):
            return audit_cycle
        else:
            raise ObjectNotFound
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


def find_by_id(audit_cycle_id):
    try:
        return AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


def set_post_approval_description(audit_cycle_id, post_approval_description):
    audit_cycle = find_by_id(audit_cycle_id)

    audit_cycle.post_approval_description = post_approval_description
    return save(audit_cycle)


def find_audit_cycles_by_client(client_id):
    return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')
