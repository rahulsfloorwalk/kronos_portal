import io
import calendar
import datetime
import xlsxwriter

from django.db.models import Prefetch

import audit.service.audit_cycle as audit_cycle_service
from client.service.client_user import find_clientuser_by_user_id
from kronos.utils import get_color_code, get_color_hex_from_code
from manager.models import City
from audit_store.models import AuditStore
from answer.models import Answer


# Get report for audit cycle client with filters
def get_aggregate_report_with_filters(audit_cycle_id, user_id, filters):
    audit_cycle_name, sections, filtered_audit_stores, city_name, date_name, month_name = get_aggregate_data_with_filters(
        audit_cycle_id, user_id, filters)
    data = create_text_structure(audit_cycle_name, sections, filtered_audit_stores)
    name = (str(audit_cycle_name) + city_name + filters.get('type') + filters.get(
        'priority') + date_name + month_name + ".xlsx").replace("-", "")
    return write_data(data), name


def get_aggregate_data_with_filters(audit_cycle_id, user_id, filters, sort='audit__store__city__name'):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, user_id)
    clientuser = find_clientuser_by_user_id(user_id)

    sections = []
    sections_qs = audit_cycle.sections.all()
    for section in sections_qs:
        if section.max_marks() > 0:
            sections.append(section)


    city_name = ''
    month_name=''

    audit_stores = AuditStore.objects \
        .filter(audit__audit_cycle=audit_cycle) \
        .presentable() \
        .visible_to(clientuser) \
        .order_by('audit_date') \
        .prefetch_related(
            'audit',
            'audit__store',
            'audit__store__city',
            'report_sections',
            'report_sections__section',
            'report_sections__section__questions',
            'report_sections__section__questions__answers',
        ).order_by(sort, "audit__store__name")

    filtered_audit_stores = audit_stores
    ignored_filters = ['', 'undefined', None]
    if filters.get('city') not in ignored_filters:
        city_name = City.objects.get(pk=int(filters.get('city'))).name
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.city.id == int(filters.get('city'))]
    if filters.get('type') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.type == filters.get('type')]
    if filters.get('priority') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.priority == filters.get('priority')]
    if filters.get('month') not in ignored_filters:
        month_name = calendar.month_name[int(filters.get('month'))]

    if filters.get('start_date') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit_date >= datetime.datetime.strptime(filters.get('start_date'), "%Y-%m-%d").date()]
    if filters.get('end_date') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit_date <= datetime.datetime.strptime(filters.get('end_date'), "%Y-%m-%d").date()]
    if filters.get('attribute') not in ignored_filters:
        attributes = filters.get('attribute')
        for attribute in attributes:
            pair = attribute.split(":")
            key = pair[0]
            value = pair[1]
            filtered_audit_stores = [x for x in filtered_audit_stores if x.attribute_data.get(key, "") == value]
    date_name = "{}{}{}".format(
        (filters.get('start_date') if filters.get('start_date') not in ignored_filters else "").replace("-", "_"),
        "_",
        (filters.get('end_date') if filters.get('end_date') not in ignored_filters else "").replace("-", "_"))

    return audit_cycle.name, sections, filtered_audit_stores, city_name, date_name, month_name


def create_text_structure(title, sections, audit_stores):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [title]}
    rows.append(row)

    if len(audit_stores) == 0:
        return rows

    # generate sections row
    section_cells = []
    for section in sections:
        section_cells.append({
            'value': section.name,
        })
    cells = [{'value': "Store Code"}, {'value': "Store Name"}, {'value': "Audit Date"}, {'value': "Total Score"}] + section_cells
    row = {'type': 'sections', 'content': cells}
    rows.append(row)

    # generate report section rows
    for audit_store in audit_stores:
        store_code_cell = {
            'value': audit_store.audit.store.code,
            'color_code': get_color_code(0, 0)
        }
        store_name_cell = {
            'value': audit_store.audit.store.name + " - " + audit_store.audit.store.city.name,
            'color_code': get_color_code(0, 0)
        }
        audit_date_cell = {
            'value': audit_store.audit_date.strftime('%d-%m-%Y'),
            'color_code': get_color_code(0, 0)
        }
        total_score_cell = {
            'value': str(round(audit_store.percentage()))+"%",
            'color_code': audit_store.color()
        }

        report_section_cells = []
        for section in sections:
            # look for the answer in the prefetched answers
            report_sections = audit_store.report_sections.all()
            for rs in report_sections:
                if rs.section_id == section.id:
                    report_section = rs
                    break

            if not report_section:
                report_section_cells.append({
                    'value': "",
                    'color_code': get_color_code(0, 0)
                })

            if report_section.not_applicable:
                report_section_cells.append({
                    'value': "Not Applicable",
                    'color_code': get_color_code(0, 0)
                })
            else:
                report_section_cells.append({
                    'value': str(round(report_section.marks_percentage()))+"%",
                    'color_code': report_section.color_code()
                })

        content = [store_code_cell, store_name_cell, audit_date_cell, total_score_cell] + report_section_cells
        row = {
            'type': 'report_section',
            'content': content
        }
        rows.append(row)
    return rows


def write_data(data):
    title_color = '#FFFFFF'
    question_color = '#BEBEBE'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    section_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': question_color,
        'font_color': 'black',
        'valign': 'vcenter',
        'font_size': 14,
    })

    title_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'font_size': 16,
        'bottom': 1,
        'bg_color': title_color,
        'font_color': 'black',
        'valign': 'vcenter',
    })

    base_answer_style = {
        'text_wrap': True,
        'bottom': 1,
        'right': 1,
        'valign': 'vcenter',
    }


    def get_format_for_color_code(wb, base_style_dict, color_code):
        colored_style = base_style_dict.copy()
        colored_style['bg_color'] = get_color_hex_from_code(color_code)
        return wb.add_format(colored_style)

    start_row = 0
    start_col = 0
    worksheet.set_column(0, 512, 15)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.merge_range(row, col, row, col + 3, point, title_format)
                col += 1
        elif line.get('type') == 'sections':
            for cell in line.get('content'):
                if isinstance(cell, dict):
                    if cell.get('colspan', 1) > 1:
                        worksheet.merge_range(row, col, row, col + cell.get('colspan') - 1, cell.get('value'),
                                              section_format)
                        col += cell.get('colspan', 1)
                    else:
                        worksheet.write(row, col, cell.get('value', ""), section_format)
                        col += 1
                else:
                    worksheet.write(row, col, cell, section_format)
                    col += 1
        elif line.get('type') == 'report_section':
            for cell in line.get('content'):
                worksheet.write(row, col, cell.get('value'),
                                get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
