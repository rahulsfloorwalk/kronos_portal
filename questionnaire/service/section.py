from kronos.exceptions import AppLogicError, ObjectNotFound
from ..models import Section
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
from audit_store import service as audit_store_service

def save(section):
    Section.save(section)
    return section

def get_for_auditor( audit_store_id, profile_info_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        profile_info = ProfileInfo.objects.get(pk=profile_info_id)
    except (AuditStore.DoesNotExist, ProfileInfo.DoesNotExist) as e:
        raise ObjectNotFound() from e

    if audit_store.user_id == profile_info.user_id:
        return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)
    else:
        raise ObjectNotFound()


def find_by_audit_store_for_client( audit_store_id, client_id):
    audit_store = audit_store_service.find_by_id_for_client(audit_store_id, client_id)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)

def find_by_audit_cycle(audit_cycle_id):
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id)
    return sections
