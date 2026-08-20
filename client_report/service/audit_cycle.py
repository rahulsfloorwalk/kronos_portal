from django.db.models import Prefetch

from kronos.exceptions import AppLogicError
# from kronos.utils import get_color_code_by_percentage
from audit.models import AuditCycle
from audit_store.models import AuditStore
from audit_store import service_client as client_service
from answer.models import ReportSection, Answer
# from registration.service import client as client_registration_service
from client.service import client_user as client_user_service
from questionnaire.models import Section,Question

def get_audit_cycle_section_averages_for_client(user, questionnaire_type_id):
    qs = AuditCycle.objects.filter(client__id=user.clientuser.client_id) \
        .filter(questionnaire_type_id=questionnaire_type_id) \
        .filter(status__in=AuditCycle.TRENDABLE_STATUSES) \
        .order_by('end_date')
    # prefetch related sections, report_sections, questions and answers
    # qs = qs.prefetch_related(
    #     'sections',
    #     Prefetch('sections__report_sections', queryset=ReportSection.objects.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],not_applicable=False )),
    #     'sections__questions',
    #     Prefetch('sections__questions__answers', queryset=Answer.objects.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED])),
    # )
    qs = qs.prefetch_related(
        'sections',
        Prefetch('sections__report_sections', queryset=ReportSection.objects.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],not_applicable=False)),
        Prefetch('sections__questions', queryset=Question.objects.filter(visibility=Question.VISIBLE_TO_ALL,hide_question=False
            ).prefetch_related(
                Prefetch('answers', queryset=Answer.objects.filter(audit_store__status__in=[AuditStore.COMPLETED,AuditStore.ACCEPTED]))
            )
        ),
    )
    return get_audit_cycle_section_averages(qs, user.id)


def get_audit_cycle_section_averages_for_client_by_audit_cycle_ids(audit_cycle_ids, questionnaire_type_id, user_id):
    qs = AuditCycle.objects.filter(
        id__in=audit_cycle_ids,
        questionnaire_type_id=questionnaire_type_id
    ).prefetch_related(
        'sections',
        Prefetch(
            'sections__report_sections',
            queryset=ReportSection.objects.filter(
                audit_store__status__in=[
                    AuditStore.COMPLETED,
                    AuditStore.ACCEPTED
                ],
                not_applicable=False
            )
        ),
        Prefetch(
            'sections__questions',
            queryset=Question.objects.filter(
                visibility=Question.VISIBLE_TO_ALL,
                hide_question=False
            ).prefetch_related(
                Prefetch(
                    'answers',
                    queryset=Answer.objects.filter(
                        audit_store__status__in=[
                            AuditStore.COMPLETED,
                            AuditStore.ACCEPTED
                        ]
                    )
                )
            )
        )
    )
    return get_audit_cycle_section_averages(qs, user_id)



def get_audit_cycle_section_averages(qs, user_id):
    audit_cycles = qs
    section_master = []
    audit_cycle_master = [audit_cycle.name for audit_cycle in audit_cycles]

    for audit_cycle in audit_cycles:
        valid_sections = Section.objects.filter(
            audit_cycle=audit_cycle.id,
            questions__visibility=Question.VISIBLE_TO_ALL,
            questions__hide_question=False,
            report_sections__not_applicable=False,
            report_sections__report_section_percentage__isnull=False
        ).distinct()

        section_averages = get_averages_for_sections_for_client_user(
            valid_sections,
            user_id
        )

        for section_average in section_averages:
            sec_name = section_average['section'].name
            if sec_name not in section_master:
                section_master.append(sec_name)

    values_table = [
        [0 for i in range(len(section_master))]
        for i in range(len(audit_cycle_master))
    ]

    for audit_cycle in audit_cycles:
        yval = audit_cycle_master.index(audit_cycle.name)

        valid_sections = Section.objects.filter(
            audit_cycle=audit_cycle.id,
            questions__visibility=Question.VISIBLE_TO_ALL,
            questions__hide_question=False,
            report_sections__not_applicable=False,
            report_sections__report_section_percentage__isnull=False
        ).distinct()

        section_averages = get_averages_for_sections_for_client_user(
            valid_sections,
            user_id
        )

        for section_average in section_averages:
            sec_name = section_average['section'].name
            xval = section_master.index(sec_name)
            values_table[yval][xval] = section_average['average']

    return {
        'title': 'Audit Cycle Summary',
        'audit_cycle_master': audit_cycle_master,
        'section_master': section_master,
        'values': values_table
    }



def get_averages_for_sections_for_client_user(sections, user_id):
    user = client_user_service.find_clientuser_by_user_id(user_id)
    visible_audit_stores = client_service.find_visible_to_client_user(user)
    client_user = user.clientuser
    client_admin = client_user.is_client_admin()

    if not client_admin:
        non_admin_user_store = client_user_service.find_non_client_admin_user_store_by_client_user_id(
            client_user.id
        )
        non_admin_user_store_list = non_admin_user_store.get_store_list()

    section_averages = []

    for section in sections:
        if section.max_marks() <= 0:
            continue

        if client_admin:
            filtered_report_sections = ReportSection.objects.filter(
                audit_store__in=visible_audit_stores,
                section=section,
                not_applicable=False
            )
        else:
            filtered_report_sections = ReportSection.objects.filter(
                audit_store__in=visible_audit_stores,
                audit_store__audit__store__id__in=non_admin_user_store_list,
                section=section,
                not_applicable=False
            )

        if not filtered_report_sections.exists():
            continue

        average = get_average_for_report_sections(filtered_report_sections)

        if average is not None:
            section_averages.append({
                'section': section,
                'average': average['value']
            })

    return section_averages


def get_average_for_report_sections(report_sections):
    counter = 0
    total = 0

    for report_section in report_sections:
        if not report_section.not_applicable and report_section.report_section_percentage is not None:
            counter += 1
            total += report_section.report_section_percentage

    if counter > 0:
        return {
            'value': int(total / counter)
        }

    return None

# def get_audit_stores_for_user(user):
#     return client_service.find_visible_to_client_user(user)

def get_section_wise_report_sections(report_sections):
    bucketed_report_sections = {}
    for report_section in report_sections:
        bucketed_report_sections.get(report_section.section, []).append(report_sections)

def get_excel_report(data):
    return data
# ###Old logic

# section_series = {}
# if(section_series.get(sec_name)):
#     section_series[sec_name].values.append({
#         'score':section_average['average'],
#         'name': audit_cycle.name
#     })
# else:
#     section_series[sec_name] = {
#         'values': [{
#             'score':section_average['average'],
#             'name': audit_cycle.name
#         }],
#         'name': section_average['section'].name,
#         'sequence': section_average['section'].sequence
#     }
# response_obj = []
# for key, value in section_series.items():
#     response_obj.append(value)
# response_obj = sorted(response_obj, key=lambda sec: sec['sequence'])
# return response_obj
