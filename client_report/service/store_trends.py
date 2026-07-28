import itertools
from django.db.models import Prefetch

from kronos.utils import get_color_code_by_percentage

from audit.models import AuditCycle
from audit.service import audit_cycle_client_service

from client.models import Store
from audit_store.models import AuditStore
from audit_store import service_client as client_service
from client.service import client_user as client_user_service
from questionnaire.models import Question


def get_performing_stores(audit_cycle, user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
        .filter(audit__audit_cycle=audit_cycle) \
        .prefetch_related(
            'audit__store__city',
            'report_sections',
            'report_sections__section',
            Prefetch(
                'report_sections__section__questions',
                queryset=Question.objects.filter(
                    visibility=Question.VISIBLE_TO_ALL,hide_question=False
                ).prefetch_related('answers')
            ),
        )
    stores = []
    for k, g in itertools.groupby(visible_audit_stores_in_cycle, lambda x: x.audit.store):
        obtained = 0
        count = 0
        for audit_store in list(g):
            obtained += audit_store.percentage()
            count += 1
        if count > 0:
            # stores[k] = obtained / count
            stores.append(({
                "id": k.id,
                "name": k.name,
                "address": k.address,
                "type": k.type,
                "code": k.code,
                "priority": k.priority,
                "city": {
                    "id": k.city.id,
                    "name": k.city.name,
                }
            }, {
                "color_code": get_color_code_by_percentage(int(obtained / count)),
                "value": int(obtained / count)
            }
            ))

    if len(stores) is 0:
        return stores
    else:
        return sorted(stores, key=lambda s: s[1].get('value'), reverse=True)


def get_performing_stores_by_audit_cycle_id(audit_cycle, user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    if client_user.is_client_admin():
        visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
            .filter(audit__audit_cycle=audit_cycle) \
            .prefetch_related(
            'audit__store__city',
            'report_sections',
            'report_sections__section',
            # 'report_sections__section__questions',
            # 'report_sections__section__questions__answers',
            Prefetch(
                'report_sections__section__questions',
                queryset=Question.objects.filter(
                    visibility=Question.VISIBLE_TO_ALL,hide_question=False
                ).prefetch_related('answers')
            ),
        )
    else:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
            .filter(audit__audit_cycle=audit_cycle,
                    audit__store__id__in=non_admin_user_store_list
                    ) \
            .prefetch_related(
            'audit__store__city',
            'report_sections',
            'report_sections__section',
            # 'report_sections__section__questions',
            # 'report_sections__section__questions__answers',
            Prefetch(
                'report_sections__section__questions',
                queryset=Question.objects.filter(
                    visibility=Question.VISIBLE_TO_ALL,hide_question=False
                ).prefetch_related('answers')
            ),
        )
    stores = []
    store_dict = {}
    for audit_store in visible_audit_stores_in_cycle:
        if str(audit_store.audit.store.id) in store_dict:
            store_dict[str(audit_store.audit.store.id)].append(audit_store)
        else:
            store_dict[str(audit_store.audit.store.id)] = [audit_store]
    for store in store_dict:
        obtained = 0
        count = 0
        for i in store_dict[store]:
            # obtained += i.percentage()
            obtained += i.audit_store_percentage
            count += 1
        k = Store.objects.get(id=store)
        stores.append(({
            "id": k.id,
            "name": k.name,
            "address": k.address,
            "type": k.type,
            "code": k.code,
            "priority": k.priority,
            "city": {
                "id": k.city.id,
                "name": k.city.name,
            }
        }, {
            "color_code": get_color_code_by_percentage(int(obtained / count)),
            "value": int(obtained / count)
        }
        ))

    if len(stores) is 0:
        return stores
    else:
        return sorted(stores, key=lambda s: s[1].get('value'), reverse=True)


def get_performing_stores_by_type_for_clientuser(questionnaire_type_id, user_id):

    qs = audit_cycle_client_service.find_by_questionnaire_type_for_clientuser(questionnaire_type_id, user_id) \
        .filter(status__in=AuditCycle.TRENDABLE_STATUSES).order_by('end_date')
    qs = qs.prefetch_related(
        'audits',
        'audits__store',
        'audits__store__city',
        Prefetch('audits__audit_stores', queryset=AuditStore.objects.presentable()),
        'audits__audit_stores__report_sections',
        'audits__audit_stores__report_sections__section',
        Prefetch(
            'audits__audit_stores__report_sections__section__questions',
            queryset=Question.objects.filter(
                visibility=Question.VISIBLE_TO_ALL,hide_question=False
            ).prefetch_related('answers')
        ),
    )

    audit_cycle_names = []

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
        # print("audit_cycles are len = 0", audit_cycles)
        return {
            'type': questionnaire_type_id,
            'questionnaire_type': questionnaire_type_id,
            'columns': [],
            'data': [],
        }

    if audit_cycle_count > 3:
        audit_cycles = qs[audit_cycle_count - 3:]
    else:
        audit_cycles = qs

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)

        data.append((audit_cycle, get_performing_stores(audit_cycle, user_id)))

    # print("data", data)

    last_cycle_performing_stores = data[-1][1]

    # print("first_cycle_performing_stores", first_cycle_performing_stores)
    # print("len(first_cycle_performing_stores)", len(first_cycle_performing_stores))

    data_1 = []
    for item in last_cycle_performing_stores:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_stores in data[:-1]:
        # print("audit_cycle", audit_cycle, "best_performing_stores", best_performing_stores)
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

    # print("data_1",data_1)
    return {
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': audit_cycle_names,
        'data': data_1
    }


def get_performing_stores_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, user_id):
    qs = AuditCycle.objects.filter(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    qs = qs.prefetch_related(
        'audits',
        'audits__store',
        'audits__store__city',
        Prefetch('audits__audit_stores', queryset=AuditStore.objects.presentable()),
        'audits__audit_stores__report_sections',
        'audits__audit_stores__report_sections__section',
        # 'audits__audit_stores__report_sections__section__questions',
        # 'audits__audit_stores__report_sections__section__questions__answers',
        Prefetch(
            'audits__audit_stores__report_sections__section__questions',
            queryset=Question.objects.filter(
                visibility=Question.VISIBLE_TO_ALL,hide_question=False
            ).prefetch_related('answers')
        ),
    )

    audit_cycle_names = []

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
        # print("audit_cycles are len = 0", audit_cycles)
        return {
            'type': questionnaire_type_id,
            'questionnaire_type': questionnaire_type_id,
            'columns': [],
            'data': [],
        }

    # if audit_cycle_count > 3:
    #     audit_cycles = qs[audit_cycle_count - 3:]
    # else:
    #     audit_cycles = qs
    audit_cycles = qs
    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)

        data.append((audit_cycle, get_performing_stores_by_audit_cycle_id(audit_cycle, user_id)))

    # print("data", data)

    last_cycle_performing_stores = data[-1][1]

    # print("first_cycle_performing_stores", first_cycle_performing_stores)
    # print("len(first_cycle_performing_stores)", len(first_cycle_performing_stores))

    data_1 = []
    for item in last_cycle_performing_stores:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_stores in data[:-1]:
        # print("audit_cycle", audit_cycle, "best_performing_stores", best_performing_stores)
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

    # print("data_1",data_1)
    return {
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': audit_cycle_names,
        'data': data_1
    }

def get_audit_stores_for_user(user):
    return client_service.find_visible_to_client_user(user)

def get_excel_report(data):
    return data
