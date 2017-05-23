from kronos.exceptions import AppLogicError
from audit.models import AuditCycle
from questionnaire.models import Section
from answer.models import ReportSection

def get_average_for_section(section_id):
    section = Section.objects.get(pk=section_id)
    report_sections = ReportSection.objects.filter(section=section).all()
    if len(report_sections) > 0:
        counter = 0
        total = 0
        for report_section in report_sections:
            counter += 1
            total += report_section.marks_percentage()
        return total/counter
    return 0

def get_section_averages_for_audit_cycle(audit_cycle_id):
    sections = Section.objects.filter(audit_cycle__id=audit_cycle_id).all()
    section_averages = []
    for section in sections:
        sec = {}
        sec['section'] = section
        sec['average'] = get_average_for_section(section.id)
        if section.max_marks() > 0:
            section_averages.append(sec)

    section_averages = sorted(section_averages, key=lambda sec: sec['section'].sequence)
    return section_averages

def get_audit_cycle_section_averages_for_client(client_id, audit_type):
    audit_cycles = AuditCycle.objects.filter(client__id=client_id).filter(type=audit_type).order_by('-end_date')
    section_series = {}
    section_master = []
    audit_cycle_master = [audit_cycle.name for audit_cycle in audit_cycles[:4]]
    for audit_cycle in audit_cycles[:4]:
        section_averages = get_section_averages_for_audit_cycle(audit_cycle.id)
        for section_average in section_averages:
            values_array = []
            sec_name = section_average.get('section').name
            try:
                section_master.index(sec_name)
            except ValueError:
                section_master.append(sec_name)
    values_table = [[0 for i in range(0, len(section_master))] for i in range(0, len(audit_cycle_master))]
    print(values_table)
    print(audit_cycle_master)
    print(section_master)
    for audit_cycle in audit_cycles[:4]:
        yval = audit_cycle_master.index(audit_cycle.name)
        section_averages = get_section_averages_for_audit_cycle(audit_cycle.id)
        for section_average in section_averages:
            sec_name = section_average['section'].name
            try:
                xval = section_master.index(sec_name)
                values_table[yval][xval] = int(section_average['average'])
            except ValueError:
                raise AppLogicError

    response_obj = {}
    response_obj['title'] = "Audit Cycle Summary"
    response_obj['audit_cycle_master'] = audit_cycle_master
    response_obj['section_master'] = section_master
    response_obj['values'] = values_table
    return response_obj


####Old logic

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
