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
        audit_stores.extend(audit.audit_stores.filter(status=AuditStore.COMPLETED))
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    mean = __get_mean_for_sections(sections, audit_stores)
    return mean

def get_store_aggregation_list_for_manager(audit_cycle_id, city_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client_id
    return get_city_section_aggregation_for_client(audit_cycle_id, city_id, client_id)

def get_store_aggregation_list_for_client(audit_cycle_id, city_id, client_id):
    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id, store__location__city_id=city_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_stores = []
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    for audit in audits:
        audit_stores.extend(audit.audit_stores.filter(status=AuditStore.COMPLETED))

    buckets = {}
    for a in audit_stores: buckets.setdefault(a.audit.store.id, []).append(a)

    mean_values = []
    for k,v in buckets.items():
        store_sections = __get_mean_for_sections(sections, v)
        mean_object = {
            'store_name': v[0].audit.store.name,
            'store_id': v[0].audit.store.id,
            'client_id': v[0].audit.store.client.id,
            'location': v[0].audit.store.location.name,
            'count': len(v),
            'sections': store_sections
        }
        mean_values.append(mean_object)

    return mean_values

def get_city_aggregation_for_client(audit_cycle_id, client_id):
    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    audit_stores = []
    for audit in audits:
        audit_stores.extend(audit.audit_stores.filter(status=AuditStore.COMPLETED))
    buckets = {}
    for a in audit_stores: buckets.setdefault(a.audit.store.location.city.id, []).append(a)
    mean_values = []
    for k,v in buckets.items():
        store_sections = __get_mean_for_sections(sections, v)
        mean_object = {
            'city_name': v[0].audit.store.location.city.name,
            'city_id': v[0].audit.store.location.city.id,
            'client_id': v[0].audit.store.client.id,
            'audit_store_count': len(v),
            'sections': store_sections
        }
        mean_values.append(mean_object)

    return mean_values



def __get_mean_for_sections(sections, audit_stores):
    mean = []

    if len(audit_stores) is 0:
        return mean

    for section in sections:
        marks = 0
        count = 0
        for audit_store in audit_stores:
            report_section = ReportSection.objects.get(section=section, audit_store=audit_store)
            marks += report_section.marks_obtained()
            count += 1
        max_marks = section.max_marks()

        marks_obtained = "{:.2f}".format(marks/count)

        if max_marks is not 0:
            percentage = int((marks * 100) / (count * max_marks))
        else:
            percentage = 0

        if percentage > 80:
            color = 4
        elif percentage > 60:
            color = 3
        elif percentage > 40:
            color = 2
        else:
            color = 1

        mean.append({
            'sequence': section.sequence,
            'section': section.name,
            'marks': marks_obtained,
            'percentage': percentage,
            'max_marks': max_marks,
            'color': color
        })
    return mean
