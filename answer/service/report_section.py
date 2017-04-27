from kronos.exceptions import ObjectNotFound, AppLogicError

from questionnaire.models import Section
from audit_store.models import AuditStore
from ..models import ReportSection
from audit_store import service as audit_store_service

def find_by_audit_store_for_user(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound() from e
    if user_id == audit_store.user_id:
        report_sections = ReportSection.objects.filter(audit_store_id=audit_store_id)
        return report_sections
    else:
        raise ObjectNotFound()

def find_by_audit_store(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        return ReportSection.objects.filter(audit_store_id=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def submit_auditor_comment(audit_store_id, section_id, user_id, auditor_comment):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        if(audit_store.status != AuditStore.ASSIGNED):
            raise AppLogicError("Cannot submit auditor comment to current audit store")
        section = Section.objects.get(pk=section_id)
    except (AuditStore.DoesNotExist, Section.DoesNotExist) as e:
        raise ObjectNotFound() from e
    if user_id == audit_store.user_id:
        try:
            report_section = ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
        except ReportSection.DoesNotExist:
            report_section = ReportSection()
            report_section.section = section
            report_section.audit_store = audit_store
        report_section.auditor_comment = auditor_comment
        report_section.auditor_comment_original = auditor_comment
        report_section.save()
        return report_section
    else:
        raise ObjectNotFound()

def submit_pm_comment(audit_store_id, section_id, pm_comment):
    try:
        if pm_comment in (None, ""):
            raise AppLogicError("auditor comment cannot be blank")
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        section = Section.objects.get(pk=section_id)
    except (AuditStore.DoesNotExist, Section.DoesNotExist) as e:
        raise ObjectNotFound() from e

    try:
        report_section = ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
    except ReportSection.DoesNotExist:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
    report_section.pm_comment = pm_comment
    report_section.save()
    return report_section


def set_auditor_comment_by_manager(audit_store_id, section_id, auditor_comment):
    try:
        if auditor_comment in (None, ""):
            raise AppLogicError("auditor comment cannot be blank")
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        if audit_store.status != AuditStore.SUBMITTED :
            raise AppLogicError("Cannot submit auditor comment to current audit store")
        section = Section.objects.get(pk=section_id)
    except (AuditStore.DoesNotExist, Section.DoesNotExist) as e:
        raise ObjectNotFound from e
    try:
        report_section = ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
    except ReportSection.DoesNotExist:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
    report_section.auditor_comment = auditor_comment
    report_section.save()
    return report_section


def find_by_audit_store_for_client(audit_store_id, client_id):
    audit_store = audit_store_service.find_by_id_for_client(audit_store_id, client_id)
    return ReportSection.objects.filter(audit_store_id=audit_store.id)
