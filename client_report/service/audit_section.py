from kronos.exceptions import ObjectNotFound
from kronos.utils import get_color_code_by_percentage

from client.service.client_user import find_clientuser_by_user_id

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from questionnaire.models import Section

from audit.service import audit_cycle as audit_cycle_service

def get_store_section_aggregation_for_manager(audit_cycle_id, store_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client_id
    return get_store_section_aggregation_for_client(audit_cycle_id, store_id, client_id)

def get_store_section_aggregation_for_client(audit_cycle_id, store_id, client_id):

    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    if (audit_cycle.client.id != int(client_id)):
        raise ObjectNotFound("Invalid Client")
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

    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    if (audit_cycle.client.id != int(client_id)):
        raise ObjectNotFound("Invalid Client")

    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id, store__city_id=city_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_stores = []
    for audit in audits:
        audit_stores.extend(audit.audit_stores.presentable())
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

    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    if (audit_cycle.client.id != int(client_id)):
        raise ObjectNotFound("Invalid Client")

    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id, store__city_id=city_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    audit_stores = []
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    for audit in audits:
        audit_stores.extend(audit.audit_stores.presentable())

    buckets = {}
    for a in audit_stores: buckets.setdefault(a.audit.store.id, []).append(a)

    mean_values = []
    for k,v in buckets.items():
        store_sections = __get_mean_for_sections(sections, v)
        mean_object = {
            'store_name': v[0].audit.store.name,
            'address': v[0].audit.store.address,
            'store_id': v[0].audit.store.id,
            'client_id': v[0].audit.store.client.id,
            'city': v[0].audit.store.city.name,
            'audit_store_count': len(v),
            'sections': store_sections
        }
        mean_values.append(mean_object)

    return mean_values

def get_city_aggregation_for_client(audit_cycle_id, client_id):

    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    if (audit_cycle.client.id != int(client_id)):
        raise ObjectNotFound("Invalid Client")

    try:
        audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    audit_stores = []
    for audit in audits:
        audit_stores.extend(audit.audit_stores.presentable())
    buckets = {}
    for a in audit_stores: buckets.setdefault(a.audit.store.city.id, []).append(a)
    mean_values = []
    for k,v in buckets.items():
        store_sections = __get_mean_for_sections(sections, v)
        mean_object = {
            'city_name': v[0].audit.store.city.name,
            'city_id': v[0].audit.store.city.id,
            'client_id': v[0].audit.store.client.id,
            'audit_store_count': len(v),
            'sections': store_sections
        }
        mean_values.append(mean_object)
    mean_values = sorted(mean_values, key = lambda name: name.get('city_name'))
    return mean_values

def get_audit_store_section_list_for_client(audit_cycle_id, store_id, client_id):

    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    if (audit_cycle.client.id != int(client_id)):
        raise ObjectNotFound("Invalid Client")

    try:
        audit = Audit.objects.get(audit_cycle_id=audit_cycle_id, store_id=store_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id).order_by('sequence').all()
    audit_stores = []
    audit_stores.extend(audit.audit_stores.presentable())
    mean_values = []
    for audit_store in audit_stores:
        store_sections = __get_mean_for_sections(sections, [audit_store,])
        mean_object = {
            'audit_store_id': audit_store.id,
            'audit_date': audit_store.audit_date,
            'sections': store_sections
        }
        mean_values.append(mean_object)
    mean_values = sorted(mean_values, key = lambda date: date.get('audit_date'))
    return mean_values

def get_audit_store_aggregation_for_client(audit_cycle_id, user_id):

    user = find_clientuser_by_user_id(user_id)
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, user_id)

    sections = Section.objects.filter(audit_cycle=audit_cycle).order_by('sequence')
    # prefetch questions once and then later again with audit_stores so that query count does not blow up
    sections = sections.prefetch_related('questions')

    audit_stores = []
    qs = AuditStore.objects \
        .filter(audit__audit_cycle=audit_cycle) \
        .presentable() \
        .visible_to(user) \
        .order_by(
            'audit__store__city__name',
            'audit__store__name',
            '-audit_date',
        ) \
        .select_related(
            # join in related audit, store and city to avoid redundant queries
            'audit',
            'audit__store',
            'audit__store__city',
        ) \
        .prefetch_related(
            # prefetch report_sections, questions and answers for the given sections
            'report_sections',
            'report_sections__section',
            'report_sections__section__questions',
            'report_sections__section__questions__answers',
        )

    for audit_store in qs:
        total_pct = audit_store.percentage()
        audit_stores.append({
            'audit_store_id': audit_store.id,
            'audit_date': audit_store.audit_date,
            'city_name': audit_store.audit.store.city.name,
            'city_id': audit_store.audit.store.city.id,
            'store_name': audit_store.audit.store.name,
            'store_id': audit_store.audit.store.id,
            'store_code': audit_store.audit.store.code,
            'store_type': audit_store.audit.store.type,
            'store_priority': audit_store.audit.store.priority,
            'sections': __get_mean_for_sections(sections, (audit_store,)),
            'total_score': {
                'percentage': total_pct,
                'max_marks': audit_store.max_marks(),  # this call is inefficient right now
                'color': get_color_code_by_percentage(total_pct),
            },
        })

    audit_stores.sort(key=lambda a_s: (a_s['city_name'], a_s['store_id'], a_s['audit_date']))
    return audit_stores


def __get_mean_for_sections(sections, audit_stores):
    mean = []

    if len(audit_stores) is 0:
        return mean

    for section in sections:
        total_percentage = 0
        count = 0

        for audit_store in audit_stores:
            # run the find by section and audit_store in python because we have already prefetched report_sections for the audit_store
            report_section = None
            for rs in audit_store.report_sections.all():
                if rs.section_id == section.id:
                    report_section = rs
            if not report_section.not_applicable:
                total_percentage += report_section.marks_percentage()
                count += 1

        if count > 0:
            avg_percentage = int(total_percentage / count)
        else:
            avg_percentage = None

        color = get_color_code_by_percentage(avg_percentage)

        mean.append({
            'sequence': section.sequence,
            'section': section.name,
            'percentage': avg_percentage,
            'max_marks': section.max_marks(),  # this call is inefficient right now
            'color': color
        })
    return mean
