from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle, Audit
import audit.service.audit_cycle as audit_cycle_service

from audit_store.models import AuditStore

from answer.models import Answer, ReportSection
from questionnaire.models import Section

def get_performing_cities(audit_cycle_id, client_id):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, client_id)

    stores = {}
    for audit in audit_cycle.audits.all():
        obtained = 0
        count = 0
        for audit_store in audit.audit_stores.presentable():
            obtained += audit_store.percentage()
            count += 1
        if count > 0: stores[audit.store] = obtained / count

    cities = {}
    for store, avg in stores.items():
        if cities.get(store.location.city) is None:
            cities[store.location.city] = (0,0)
        total, count = cities[store.location.city]
        cities[store.location.city] = (total + avg, count+1)

    averages = []
    for city, (total, count) in cities.items():
        if count > 0:
            averages.append(
                ({
                    "id": city.id,
                    "name": city.name,
                }, int(total / count))
            )
        else:
            averages.append(
                ({
                    "id": city.id,
                    "name": city.name,
                }, None)
            )

    if len(averages) is 0:
        return averages
    else:
        return sorted(averages, key=lambda s: s[1], reverse=True)


def get_performing_cities_by_type_for_clientuser(audit_type, user_id):
    #print("got audit_type",audit_type)

    audit_cycles = audit_cycle_service.find_by_audit_type_for_clientuser(audit_type, user_id)
    audit_cycle_names = []

    if len(audit_cycles) is 0:
        #print("audit_cycles are len = 0", audit_cycles)
        return []

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)

        data.append((audit_cycle, get_performing_cities(audit_cycle.id, user_id)))

    #print("data", data)

    first_cycle_performing_cities = data[0][1]

    #print("first_cycle_performing_stores", first_cycle_performing_stores)
    #print("len(first_cycle_performing_stores)", len(first_cycle_performing_stores))

    data_1 = []
    for item in first_cycle_performing_cities:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_cities in data[1:]:
        #print("audit_cycle", audit_cycle, "best_performing_stores", best_performing_stores)
        for item in first_cycle_performing_cities:
            found_item = None
            for s in best_performing_cities:
                if s[0]['id'] == item[0]['id']:
                    found_item = s

            for d in data_1:
                if d[0]['id'] == item[0]['id']:
                    if found_item is None:
                        d[1].append(0)
                    else:
                        d[1].append(found_item[1])

    #print("data_1",data_1)
    return {
            'type': audit_type,
            'columns': audit_cycle_names,
            'data': data_1
    }
