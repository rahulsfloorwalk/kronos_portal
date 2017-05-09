from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle, Audit
import audit.service.audit_cycle as audit_cycle_service

from audit_store.models import AuditStore

from answer.models import Answer, ReportSection
from questionnaire.models import Section

def get_performing_stores(audit_cycle_id, client_id):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, client_id)

    stores = []
    for audit in audit_cycle.audits.all():
        obtained = 0
        count = 0
        for audit_store in audit.audit_stores.filter(status=AuditStore.COMPLETED):
            obtained += audit_store.percentage()
            count += 1
        if count > 0: stores.append(({
            "name": audit.store.name,
            "address": audit.store.address,
            "city": {
                "id": audit.store.location.city.id,
                "name": audit.store.location.city.name,
            }
        }, obtained / count))


    top_5 = sorted(stores, key=lambda s: s[1], reverse=True)[:5]
    worst_5 = sorted(stores, key=lambda s: s[1])[:5]

    return {
        "top_5": top_5,
        "worst_5": worst_5
    }
