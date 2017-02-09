from django.db import IntegrityError

from client.models import Client
from .models import AuditStore
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound, AppLogicError

def get_audit_stores(profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.filter(user_id=profile_info.user_id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit_cycle(audit_cycle_id):
    try:
        audit_stores = []
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        for audit in audit_cycle.audits.all():
            audit_stores.extend(audit.audit_stores.all())
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    return audit_stores

def get_audit_store(audit_store_id, profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.get(id=audit_store_id, user_id=profile_info.user_id)
    except (ProfileInfo.DoesNotExist, AuditStore.DoesNotExist) as e:
        raise ObjectNotFound from e


def find_latest_for_client(client_id):
    return AuditStore.objects.filter(audit__audit_cycle__client_id=client_id, status=AuditStore.COMPLETED)[:5]


def find_by_store_for_client(store_id, client_id):
    return AuditStore.objects.filter(
            audit__audit_cycle__client_id=client_id, 
            audit__store_id=store_id,
            status=AuditStore.COMPLETED,
        )

def find_by_id_for_client(audit_store_id, client_id):
    try:
        return AuditStore.objects.get(
                audit__audit_cycle__client_id=client_id, 
                id=audit_store_id,
                status=AuditStore.COMPLETED,
            )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def save(audit_store):
    AuditStore.save(audit_store)
    return audit_store
