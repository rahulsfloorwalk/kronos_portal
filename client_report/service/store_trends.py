from django.db.models import Prefetch

from kronos.exceptions import ObjectNotFound, AppLogicError
from kronos.utils import get_color_code_by_percentage

from audit.models import AuditCycle, Audit
import audit.service.audit_cycle as audit_cycle_service

from audit_store.models import AuditStore

from answer.models import Answer, ReportSection
from questionnaire.models import Section

def get_performing_stores(audit_cycle):
    stores = []
    for audit in audit_cycle.audits.all():
        obtained = 0
        count = 0
        for audit_store in audit.audit_stores.all():
            obtained += audit_store.percentage()
            count += 1
        if count > 0:
            stores.append(({
                "id": audit.store.id,
                "name": audit.store.name,
                "address": audit.store.address,
                "type": audit.store.type,
                "code": audit.store.code,
                "priority": audit.store.priority,
                "city": {
                    "id": audit.store.location.city.id,
                    "name": audit.store.location.city.name,
                }
            },
            {
                "color_code": get_color_code_by_percentage(int(obtained / count)),
                "value": int(obtained / count)
            }
            ))


    if len(stores) is 0:
        return stores
    else:
        return sorted(stores, key=lambda s: s[1].get('value'), reverse=True)


def get_performing_stores_by_type_for_clientuser(audit_type, user_id):
    #print("got audit_type",audit_type)

    qs = audit_cycle_service.find_by_audit_type_for_clientuser(audit_type, user_id).order_by('end_date')
    qs = qs.prefetch_related(
        'audits',
        'audits__store',
        'audits__store__location',
        'audits__store__location__city',
        Prefetch('audits__audit_stores', queryset=AuditStore.objects.presentable()),
        'audits__audit_stores__report_sections',
        'audits__audit_stores__report_sections__section',
        'audits__audit_stores__report_sections__section__questions',
        'audits__audit_stores__report_sections__section__questions__answers',
    )

    audit_cycle_names = []

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
        #print("audit_cycles are len = 0", audit_cycles)
        return []

    if audit_cycle_count > 3:
        audit_cycles = qs[audit_cycle_count - 3:]
    else:
        audit_cycles = qs

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)

        data.append((audit_cycle, get_performing_stores(audit_cycle)))

    #print("data", data)

    last_cycle_performing_stores = data[-1][1]

    #print("first_cycle_performing_stores", first_cycle_performing_stores)
    #print("len(first_cycle_performing_stores)", len(first_cycle_performing_stores))

    data_1 = []
    for item in last_cycle_performing_stores:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_stores in data[:-1]:
        #print("audit_cycle", audit_cycle, "best_performing_stores", best_performing_stores)
        for item in last_cycle_performing_stores:
            found_item = None
            for store, score in best_performing_stores:
                if store['id'] == item[0]['id']:
                    found_item = (store, score)

            for store, score_series in data_1:
                if store['id'] == item[0]['id']:
                    if found_item is None:
                        score_series.append(None)
                    else:
                        score_series.append(found_item[1])

    # move the first element to the end of the series
    # to maintain ordering as per the audit cycles
    for store, score_series in data_1:
        score_series.append(score_series.pop(0))

    #print("data_1",data_1)
    return {
            'type': audit_type,
            'columns': audit_cycle_names,
            'data': data_1
    }

def get_excel_report(data):
    return data