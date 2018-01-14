from django.db.models import Prefetch

import audit.service.audit_cycle as audit_cycle_service
from audit_store.models import AuditStore
from kronos.utils import get_color_code_by_percentage


def get_performing_cities(audit_cycle):
    stores = {}

    for audit in audit_cycle.audits.all():
        obtained = 0
        count = 0
        for audit_store in audit.audit_stores.all():
            obtained += audit_store.percentage()
            count += 1
        if count > 0: stores[audit.store] = obtained / count

    cities = {}
    for store, avg in stores.items():
        if cities.get(store.city) is None:
            cities[store.city] = (0,0)
        total, count = cities[store.city]
        cities[store.city] = (total + avg, count + 1)

    averages = []
    for city, (total, count) in cities.items():
        if count > 0:
            averages.append(
                ({
                    "id": city.id,
                    "name": city.name,
                }, {
                    "color_code": get_color_code_by_percentage(int(total / count)),
                    "value": int(total / count)
                })
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
        return sorted(averages, key=lambda s: s[1].get('value'), reverse=True)


def get_performing_cities_by_type_for_clientuser(audit_type, user_id):
    qs = audit_cycle_service.find_by_audit_type_for_clientuser(audit_type, user_id).order_by('end_date')
    qs = qs.prefetch_related(
        'audits',
        'audits__store',
        'audits__store__city',
        Prefetch('audits__audit_stores', queryset=AuditStore.objects.presentable()),
        'audits__audit_stores__report_sections',
        'audits__audit_stores__report_sections__section',
        'audits__audit_stores__report_sections__section__questions',
        'audits__audit_stores__report_sections__section__questions__answers',
    )

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
        return []

    if audit_cycle_count > 3:
        audit_cycles = qs[audit_cycle_count - 3:]
    else:
        audit_cycles = qs

    audit_cycle_names = []

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)
        data.append((audit_cycle, get_performing_cities(audit_cycle)))

    last_cycle_performing_cities = data[-1][1]

    # print("first_cycle_performing_stores", first_cycle_performing_stores)
    # print("len(first_cycle_performing_stores)", len(first_cycle_performing_stores))

    data_1 = []
    for item in last_cycle_performing_cities:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_cities in data[:-1]:
        # print("audit_cycle", audit_cycle, "best_performing_stores", best_performing_stores)
        for item in last_cycle_performing_cities:
            found_item = None

            # look for the city in best cities for the current audit cycle
            for city, score in best_performing_cities:
                if city['id'] == item[0]['id']:
                    # store in variable if found
                    found_item = (city, score)

            for city, score_series in data_1:
                if city['id'] == item[0]['id']:
                    if found_item is None:
                        score_series.append(None)
                    else:
                        score_series.append(found_item[1])

    # move the first element to the end of the series
    # to maintain ordering as per the audit cycles
    for city, score_series in data_1:
        score_series.append(score_series.pop(0))

    # print("data_1",data_1)
    return {
        'type': audit_type,
        'columns': audit_cycle_names,
        'data': data_1
    }

def get_excel_report(data):
    return data
