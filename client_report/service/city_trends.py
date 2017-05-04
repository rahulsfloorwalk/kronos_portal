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
        for audit_store in audit.audit_stores.filter(status=AuditStore.COMPLETED):
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
        if count > 0: averages.append((city.name, total / count))
        else: averages.append((city.name, None))

    worst_5 = sorted(averages, key=lambda a: a[1])[:5]
    top_5 = sorted(averages, key=lambda a: a[1], reverse=True)[:5]

    return {
        "top_5": top_5,
        "worst_5": worst_5
    }
