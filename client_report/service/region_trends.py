import itertools
from django.db.models import Prefetch

from audit.models import AuditCycle

from audit_store.models import AuditStore
from kronos.utils import get_color_code_by_percentage
from audit_store import service_client as client_service
from client.service import client_user as client_user_service
from questionnaire.models import Question


def get_performing_regions(audit_cycle, user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    stores = {}
    if client_user.is_client_admin():
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
    else:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        visible_audit_stores_in_cycle = client_service.find_visible_to_client_user(user) \
            .filter(audit__audit_cycle=audit_cycle,
                    audit__store__id__in=non_admin_user_store_list) \
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
    for k, g in itertools.groupby(visible_audit_stores_in_cycle, lambda x: x.audit.store):
        obtained = 0
        count = 0
        for audit_store in list(g):
            obtained += audit_store.audit_store_percentage
            count += 1
        if count > 0: stores[k] = obtained / count
    regions = {}
    for store, avg in stores.items():
        if not store.extra_data.get('REGION'):
            continue
        if regions.get(store.extra_data.get('REGION')) is None:
            regions[store.extra_data.get('REGION')] = (0,0)
        total, count = regions[store.extra_data.get('REGION')]
        regions[store.extra_data.get('REGION')] = (total + avg, count + 1)

    averages = []
    for region, (total, count) in regions.items():
        if count > 0:
            averages.append(
                ({
                    "name": region,
                }, {
                    "color_code": get_color_code_by_percentage(int(total / count)),
                    "value": int(total / count)
                })
            )
        else:
            averages.append(
                ({
                    "name": region,
                }, None)
            )

    if len(averages) is 0:
        return averages
    else:
        return sorted(averages, key=lambda s: s[1].get('value'), reverse=True)


def get_performing_regions_by_type_by_audit_cycle_id_for_clientuser(questionnaire_type_id, audit_cycle_id, user_id):
    qs = AuditCycle.objects.filter(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
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

    audit_cycle_count = qs.count()
    if audit_cycle_count is 0:
        return {
            'type': questionnaire_type_id,
            'questionnaire_type': questionnaire_type_id,
            'columns': [],
            'data': [],
        }

    audit_cycles = qs
    audit_cycle_names = []

    data = []
    for audit_cycle in audit_cycles:
        audit_cycle_names.append(audit_cycle.name)
        data.append((audit_cycle, get_performing_regions(audit_cycle, user_id)))

    last_cycle_performing_regions = data[-1][1]

    data_1 = []
    for item in last_cycle_performing_regions:
        data_1.append((item[0],[item[1]]))

    for audit_cycle, best_performing_regions in data[:-1]:
        for item in last_cycle_performing_regions:
            found_item = None

            # look for the region in best regions for the current audit cycle
            for region, score in best_performing_regions:
                if region['id'] == item[0]['id']:
                    # store in variable if found
                    found_item = (region, score)

            for region, score_series in data_1:
                if region['id'] == item[0]['id']:
                    if found_item is None:
                        score_series.append(None)
                    else:
                        score_series.append(found_item[1])

    # move the first element to the end of the series
    # to maintain ordering as per the audit cycles
    for region, score_series in data_1:
        score_series.append(score_series.pop(0))

    return {
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': audit_cycle_names,
        'data': data_1
    }