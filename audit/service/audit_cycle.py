from django.contrib.auth.models import User
from django.db.models import Q

from guardian.shortcuts import get_objects_for_user

from kronos.exceptions import AppLogicError, ObjectNotFound

from registration.models import GROUP_NAME_CLIENT, GROUP_NAME_MODERATOR

from registration.service.moderator import find_moderator_by_user_id

from ..models import AuditCycle
from auditor.models import AuditApplication as application_model
from audit_store.models import AuditStore  as store_model

def save(audit):
    AuditCycle.save(audit)
    return audit

def find_for_clientuser(user_id):
    try:
        user = User.objects.get(pk=user_id)
        return AuditCycle.objects.filter(client_id=user.clientuser.client_id, status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE)).order_by('-end_date')
    except (User.DoesNotExist, ) as e:
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
    for key in application_model.STATUS:
        if not result.get('application').get(key[0]):
            result.get('application')[key[0]] = 0
    for key in store_model.STATUS:
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

