from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Section

def get_store_section_aggregation_for_manager(audit_cycle_id, store_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client_id
    return get_store_section_aggregation_for_client(audit_cycle_id, store_id, client_id)

def get_store_section_aggregation_for_client(audit_cycle_id, store_id, client_id):
    try:
        audit = Audit.objects.get(audit_cycle_id=audit_cycle_id, store_id=store_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_stores = audit.audit_stores.all()
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    mean = __get_mean_for_sections(sections, audit_stores)
    return mean

def get_city_section_aggregation_for_manager(audit_cycle_id, city_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client_id
    return get_city_section_aggregation_for_client(audit_cycle_id, city_id, client_id)

def get_city_section_aggregation_for_client(audit_cycle_id, city_id, client_id):
    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id, store__location__city_id=city_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_stores = []
    for audit in audits:
        audit_stores.extend(audit.audit_stores.all())
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    mean = __get_mean_for_sections(sections, audit_stores)
    return mean

def __get_mean_for_sections(sections, audit_stores):
    mean = []
    for section in sections:
        marks = 0
        count = 0
        for audit_store in audit_stores:
            report_section = ReportSection.objects.get(section=section, audit_store=audit_store)
            marks += report_section.marks_obtained()
            count += 1
        max_marks = section.max_marks()
        marks_obtained = "{:.2f}".format(marks/count)
        mean.append({
            'sequence':section.sequence,
            'section':section.name,
            'marks':marks_obtained,
            'max':max_marks
        })
    return mean
