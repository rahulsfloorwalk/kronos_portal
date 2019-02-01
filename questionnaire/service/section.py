from django.db.utils import IntegrityError
from django.db.transaction import atomic

from kronos.exceptions import AppLogicError, ObjectNotFound

from questionnaire.models import Section
from audit.models import AuditCycle
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
import audit_store.service_client as audit_store_client_service
from audit_store import service_agency as audit_store_agency_service

from questionnaire.service import question as question_service

def save(section):
    Section.save(section)
    return section

def delete_section_by_id(section_id):
    try:
        s = Section.objects.get(pk=section_id)
        s.delete()
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("cannot delete section that has questions or comments on it") from e

def find_by_audit_cycle_and_id(audit_cycle_id, section_id):
    try:
        return Section.objects.get(audit_cycle_id=audit_cycle_id, pk=section_id)
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e

def find_section_by_id(section_id):
    try:
        return Section.objects.get(pk=section_id)
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e

def get_for_auditor(audit_store_id, profile_info_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        profile_info = ProfileInfo.objects.get(pk=profile_info_id)
    except (AuditStore.DoesNotExist, ProfileInfo.DoesNotExist) as e:
        raise ObjectNotFound() from e

    if audit_store.user_id == profile_info.user_id:
        return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)
    else:
        raise ObjectNotFound()


def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_agency_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)


def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    from audit_store.service_moderator import find_by_id_for_moderator
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)

def find_by_audit_cycle(audit_cycle_id):
    return Section.objects.filter(audit_cycle_id=audit_cycle_id)

@atomic
def copy_sections_from_to(from_audit_cycle_id, to_audit_cycle_id):
    try:
        from_audit_cycle = AuditCycle.objects.get(pk=from_audit_cycle_id)
        to_audit_cycle = AuditCycle.objects.get(pk=to_audit_cycle_id)

        if to_audit_cycle.sections.count() > 0:
            raise AppLogicError("audit cycle already has sections")

        for section in from_audit_cycle.sections.all():
            new_section = Section()
            new_section.name = section.name
            new_section.sequence = section.sequence
            new_section.minimum_attachment_count = section.minimum_attachment_count
            new_section.audit_cycle = to_audit_cycle
            new_section.save()
            question_service.copy_questions_from_to(section.id, new_section.id)

        return to_audit_cycle.sections.all()

    except (AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e

