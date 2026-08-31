import itertools
from django.db.models import Prefetch

from audit.models import AuditCycle
from audit.service import audit_cycle_client_service

from audit_store.models import AuditStore
from kronos.utils import get_color_code_by_percentage
from audit_store import service_client as client_service
from client.service import client_user as client_user_service
from questionnaire.models import Question


def get_performing_cities(audit_cycle, user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    stores = {}
    if client_user.is_client_admin():
        visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
            .filter(audit__audit_cycle=audit_cycle,status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]
            ) \
            .prefetch_related('audit__store__city','report_sections','report_sections__section',
                Prefetch('report_sections__section__questions',
                    queryset=Question.objects.filter(visibility=Question.VISIBLE_TO_ALL, hide_question=False
                    ).prefetch_related('answers')
                ),)
    else:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
            .filter(audit__audit_cycle=audit_cycle,audit__store__id__in=non_admin_user_store_list,
                status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]
            ) \
            .prefetch_related('audit__store__city','report_sections','report_sections__section',
                Prefetch(
                    'report_sections__section__questions',
                    queryset=Question.objects.filter(visibility=Question.VISIBLE_TO_ALL,hide_question=False).prefetch_related('answers')
                ),)
    for k, g in itertools.groupby(visible_audit_stores_in_cycle, lambda x: x.audit.store):
        obtained = 0
        count = 0
        for audit_store in list(g):
            obtained += audit_store.audit_store_percentage
            count += 1
        if count > 0: stores[k] = obtained / count
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
                ({"id": city.id,"name": city.name,
                }, {
                    "color_code": get_color_code_by_percentage(int(total / count)), "value": int(total / count)
                }))
        else:
            averages.append(
                ({"id": city.id,"name": city.name,}, None))
    if len(averages) is 0:
        return averages
    else:
        return sorted(averages, key=lambda s: s[1].get('value'), reverse=True)

def get_performing_cities_by_type_for_clientuser(questionnaire_type_id, user_id):
    qs = audit_cycle_client_service.find_by_questionnaire_type_for_clientuser(questionnaire_type_id, user_id) \
        .filter(status__in=AuditCycle.LIVE_REPORTING_STATUSES).order_by('end_date')
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
                visibility=Question.VISIBLE_TO_ALL,
                hide_question=False
            ).prefetch_related('answers')
        ),
    )

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
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

    audit_cycle_names = []

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)
        data.append((audit_cycle, get_performing_cities(audit_cycle, user_id)))

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
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': audit_cycle_names,
        'data': data_1
    }

def get_city_performance_range_wise_for_clientuser(questionnaire_type_id,audit_cycle_ids,user_id):
    audit_cycles=AuditCycle.objects.filter(id__in=audit_cycle_ids,questionnaire_type_id=questionnaire_type_id,status__in=AuditCycle.LIVE_REPORTING_STATUSES)
    cycle_map={cycle.id:cycle for cycle in audit_cycles}
    audit_cycles=[cycle_map[cycle_id] for cycle_id in audit_cycle_ids if cycle_id in cycle_map]
    if not audit_cycles:
        return {'type':questionnaire_type_id,'questionnaire_type':questionnaire_type_id,'columns':[],'data':[]}
    ranges=[('0 - 20',0,20),('21 - 40',21,40),('41 - 60',41,60),('61 - 80',61,80),('81 - 100',81,100)]
    audit_cycle_names=[audit_cycle.name for audit_cycle in audit_cycles]
    cycle_city_data={}
    for audit_cycle in audit_cycles:
        cities=get_performing_cities(audit_cycle,user_id)
        cycle_city_data[audit_cycle.id]=[ {'city':city,'score':score} for city,score in cities]
    data=[]
    for range_name,minimum,maximum in ranges:
        range_data=[]
        for audit_cycle in audit_cycles:
            range_cities=[]
            for city_data in cycle_city_data[audit_cycle.id]:
                city=city_data['city']
                score=city_data['score']
                value=score.get('value',0) if score else 0
                if minimum<=value<=maximum:
                    range_cities.append({'city':city,'score':score})
            range_data.append({
                'audit_cycle_id':audit_cycle.id,'audit_cycle_name':audit_cycle.name,
                'city_count':len(range_cities),'cities':range_cities
            })
        data.append({'range':range_name,'cycles':range_data})
    return {
        'type':questionnaire_type_id,'questionnaire_type':questionnaire_type_id,
        'columns':audit_cycle_names,'data':data
    }

def get_performing_cities_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, user_id):
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
        Prefetch('audits__audit_stores__report_sections__section__questions',
            queryset=Question.objects.filter(
                visibility=Question.VISIBLE_TO_ALL,
                hide_question=False
            ).prefetch_related('answers')
        ),
    )

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
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
    audit_cycle_names = []

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)
        data.append((audit_cycle, get_performing_cities(audit_cycle, user_id)))

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
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': audit_cycle_names,
        'data': data_1
    }

def get_excel_report(data):
    return data
