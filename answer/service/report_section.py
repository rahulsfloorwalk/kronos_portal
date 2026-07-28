from kronos.exceptions import ObjectNotFound, AppLogicError

from questionnaire.models import Section, Question

import questionnaire.service.section as section_service

from audit_store.models import AuditStore
from ..models import ReportSection
from audit_store import service as audit_store_service
from audit_store import service_client as audit_store_client_service
from django.db.models import Prefetch
from answer.models import Answer

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
        return ReportSection.objects.filter(audit_store_id=audit_store.id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


def find_by_audit_store_and_section(audit_store_id, section_id):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        section = section_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id, section_id)
        return ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
    except ReportSection.DoesNotExist as e:
        report_section = ReportSection()
        report_section.section = section
        report_section.audit_store = audit_store
        report_section.save()
        return report_section

def find_by_audit_cycle_sections_mandatory_proof(audit_store_id):
    report_sections = []
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        sections = section_service.find_by_audit_cycle_mandatory_proof(audit_store.audit.audit_cycle_id)
    except Exception:
        return []
    for section in sections:
        report_section = ReportSection.objects.filter(audit_store_id=audit_store.id,section_id=section.id).first()

        if not report_section:
            try:
                report_section = ReportSection(audit_store=audit_store,section=section)
                report_section.save()
            except Exception:
                continue
        report_sections.append(report_section)
    return report_sections

def submit_auditor_comment(audit_store_id, section_id, user_id, auditor_comment):
    if len(auditor_comment) < ReportSection.MIN_AUDITOR_COMMENT_LEN:
        raise AppLogicError("Section summary must be {} characters in length".format(ReportSection.MIN_AUDITOR_COMMENT_LEN))
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        if(audit_store.status != AuditStore.ACKNOWLEDGED):
            raise AppLogicError("Cannot submit auditor comment to current audit store")
        section = Section.objects.get(pk=section_id)
    except (AuditStore.DoesNotExist, Section.DoesNotExist) as e:
        raise ObjectNotFound() from e
    if section.hide_comment:
        raise AppLogicError("Cannot submit comment to current audit store")
    if user_id == audit_store.user_id:
        try:
            report_section = ReportSection.objects.get(audit_store_id=audit_store.id, section_id=section.id)
        except ReportSection.DoesNotExist:
            report_section = ReportSection()
            report_section.section = section
            report_section.audit_store = audit_store
        report_section.auditor_comment = auditor_comment
        report_section.auditor_comment_original = auditor_comment
        report_section.pm_comment = "--"
        report_section.save()
        return report_section
    else:
        raise ObjectNotFound()


def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return ReportSection.objects.filter(audit_store_id=audit_store.id).prefetch_related('section','section__questions','section__questions__answers')

def find_by_audit_store_for_client_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return ReportSection.objects.filter(
        audit_store_id=audit_store.id
    ).prefetch_related(
        'section',
        Prefetch(
            'section__questions',
            queryset=Question.objects.filter(
                visibility=Question.VISIBLE_TO_ALL,hide_question=False
            ).prefetch_related(
                Prefetch(
                    'answers',
                    queryset=Answer.objects.filter(
                        question__visibility=Question.VISIBLE_TO_ALL,question__hide_question=False
                    )
                )
            )
        ),
    )

def find_by_audit_store_and_section_for_client(audit_store_id, section_id, client_id):
    report_section = find_by_audit_store_and_section(audit_store_id, section_id)
    if report_section.audit_store.audit.audit_cycle.client.id == client_id:
        return report_section
    else:
        raise ObjectNotFound


def get_answer_section_id_by_section_id(audit_store_id, section_id):
    return ReportSection.objects.get(audit_store__id=audit_store_id, section__id=section_id).id
