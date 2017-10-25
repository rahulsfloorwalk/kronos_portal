from django.db.models import Prefetch

from kronos.exceptions import AppLogicError
from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.models import ReportSection, Answer

def get_average_for_section(section):
    report_sections = section.report_sections.all()
    if len(report_sections) > 0:
        counter = 0
        total = 0
        for report_section in report_sections:
            if not report_section.not_applicable:
                counter += 1
                total += report_section.marks_percentage()
        if counter > 0:
            return int(total / counter)
    return None

def get_section_averages_for_audit_cycle(audit_cycle):
    sections = audit_cycle.sections.all()
    section_averages = []
    for section in sections:
        sec = {}
        sec['section'] = section
        sec['average'] = get_average_for_section(section)
        if section.max_marks() > 0:
            section_averages.append(sec)

    section_averages = sorted(section_averages, key=lambda sec: sec['section'].sequence)
    return section_averages

def get_audit_cycle_section_averages_for_client(client_id, audit_type):
    qs = AuditCycle.objects.filter(client__id=client_id).filter(type=audit_type).order_by('end_date')
    # prefetch related sections, report_sections, questions and answers
    qs = qs.prefetch_related(
        'sections',
        Prefetch('sections__report_sections', queryset=ReportSection.objects.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED])),
        'sections__questions',
        Prefetch('sections__questions__answers', queryset=Answer.objects.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED])),
    )

    audit_cycle_count = qs.count()
    if audit_cycle_count > 3:
        audit_cycles = qs[audit_cycle_count - 3:]
    else:
        audit_cycles = qs
    section_master = []
    audit_cycle_master = [audit_cycle.name for audit_cycle in audit_cycles]
    # print("audit_cycles", [(ac.name, ac.end_date) for ac in audit_cycles])
    for audit_cycle in audit_cycles:
        section_averages = get_section_averages_for_audit_cycle(audit_cycle)
        for section_average in section_averages:
            sec_name = section_average.get('section').name
            try:
                section_master.index(sec_name)
            except ValueError:
                section_master.append(sec_name)
    values_table = [[0 for i in range(0, len(section_master))] for i in range(0, len(audit_cycle_master))]
    # print("values_table", values_table)
    # print("audit_cycle_master", audit_cycle_master)
    # print("section_master", section_master)
    for audit_cycle in audit_cycles:
        yval = audit_cycle_master.index(audit_cycle.name)
        section_averages = get_section_averages_for_audit_cycle(audit_cycle)
        for section_average in section_averages:
            sec_name = section_average['section'].name
            try:
                xval = section_master.index(sec_name)
                values_table[yval][xval] = section_average['average']
            except ValueError as e:
                raise AppLogicError from e

    response_obj = {}
    response_obj['title'] = "Audit Cycle Summary"
    response_obj['audit_cycle_master'] = audit_cycle_master
    response_obj['section_master'] = section_master
    response_obj['values'] = values_table
    return response_obj


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
