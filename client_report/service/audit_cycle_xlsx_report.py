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
from questionnaire.models import Question
from manager.states import get_state_code
from manager.country import get_country_code

# Get report for audit cycle client with filters
def get_aggregate_report_with_filters(audit_cycle_id, user_id, filters):
    audit_cycle_name, sections, questions, filtered_audit_stores, city_name, state, country, date_name, month_name = get_aggregate_data_with_filters(
        audit_cycle_id, user_id, filters)
    data = create_text_structure(audit_cycle_name, sections, questions, filtered_audit_stores)
    '''name = (str(audit_cycle_name) + city_name + state + country + filters.get('type') + filters.get(
        'priority') + date_name + month_name + ".xlsx").replace("-", "")'''
    name = (str(audit_cycle_name))
    if city_name:
        name = name + "_" + city_name
    if state:
        name = name + "_" + state
    if country:
        name = name + "_" + country
    if filters.get('type'):
        name = name + "_" + filters.get('type')
    if filters.get('priority'):
        name = name + "_" + filters.get('priority')
    if date_name:
        name = name + date_name
    if month_name:
        name = name + "_" + month_name
    name = name + ".xlsx"
    name = name.replace("-", "")
    return write_data(data), name


def get_aggregate_data_with_filters(audit_cycle_id, user_id, filters, sort='audit_date'):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, user_id)
    clientuser = find_clientuser_by_user_id(user_id)

    sections = audit_cycle.sections.order_by('sequence').prefetch_related(
        Prefetch('questions', queryset=Question.objects.order_by('section__sequence','sequence')),
    )

    city_name = ''
    country = filters.get('country', '')
    country_code = get_country_code(country)
    state = filters.get('state', '')
    state_code = get_state_code(state)
    month_name=''
    questions = []
    for section in sections:
        questions.extend(section.questions.all())

    audit_stores = AuditStore.objects \
        .filter(audit__audit_cycle=audit_cycle) \
        .presentable() \
        .visible_to(clientuser) \
        .order_by('audit_date') \
        .prefetch_related(
            'audit',
            'audit__store',
            'audit__store__city',
            'answers',
            'report_sections',
        ).order_by(sort)

    filtered_audit_stores = audit_stores
    ignored_filters = ['', 'undefined', None, [], ['']]
    if filters.get('city') not in ignored_filters:
        city_name = City.objects.get(pk=int(filters.get('city'))).name
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.city.id == int(filters.get('city'))]
    if state_code not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.city.state == state_code]
    if country_code not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.city.country == country_code]
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
    create_text_structure(audit_cycle.name, sections, questions, filtered_audit_stores)
    date_name = "{}{}{}".format(
        (filters.get('start_date') if filters.get('start_date') not in ignored_filters else "").replace("-", "_"),
        "_",
        (filters.get('end_date') if filters.get('end_date') not in ignored_filters else "").replace("-", "_"))

    return audit_cycle.name, sections, questions, filtered_audit_stores, city_name, state, country, date_name, month_name


def create_text_structure(title, sections, questions, audit_stores):
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
            'colspan': len(section.questions.all())
        })
    cells = [{'value': "SECTIONS", 'colspan': 3}] + section_cells
    row = {'type': 'sections', 'content': cells}
    rows.append(row)

    # generate questions row
    question_cells = []
    for question in questions:
        question_cells.append(question.question_txt)
    content = ["Store Code", "Store", "Store City", "Audit Date"] + question_cells
    row = {'type': 'question', 'content': content}
    rows.append(row)

    # generate answer rows
    for audit_store in audit_stores:
        store_code_cell = {
            'value': audit_store.audit.store.code,
            'color_code': get_color_code(0, 0)
        }
        store_name_cell = {
            'value': audit_store.audit.store.name + " - " + audit_store.audit.store.city.name,
            'color_code': get_color_code(0, 0)
        }
        store_city_cell = {
            'value': audit_store.audit.store.city.name,
            'color_code': get_color_code(0, 0)
        }
        audit_date_cell = {
            'value': audit_store.audit_date.strftime('%d-%m-%Y'),
            'color_code': get_color_code(0, 0)
        }

        answer_cells = []
        for question in questions:
            # look for the answer in the prefetched answers
            for a in audit_store.answers.all():
                if a.question_id == question.id:
                    answer = a
                    break

            # look for the report_section in the prefetched report_sections
            for rs in audit_store.report_sections.all():
                if rs.section_id == question.section_id:
                    report_section = rs
                    break

            if not report_section or not answer:
                answer_cells.append({
                    'value': "",
                    'color_code': get_color_code(0, 0)
                })

            if report_section.not_applicable:
                answer_cells.append({
                    'value': "Not Applicable",
                    'color_code': get_color_code(0, 0)
                })
            elif answer.not_applicable:
                answer_cells.append({
                    'value': "Not Applicable",
                    'color_code': get_color_code(0, 0)
                })
            else:
                if answer.question.question_type == Question.MUTEX:
                    if answer.answer_comment:
                        answer_val = answer.answer_text + " (" + answer.answer_comment + ")"
                    else:
                        answer_val = answer.answer_text
                elif answer.question.question_type == Question.MULTISELECT:
                    answer_val = answer.answer_text.replace(";", ", ")
                else:
                    answer_val = answer.answer_text
                answer_cells.append({
                    'value': answer_val,
                    'color_code': get_color_code(answer.marks_obtained, question.max_marks)
                })

        content = [store_code_cell, store_name_cell, store_city_cell, audit_date_cell] + answer_cells
        row = {
            'type': 'answer',
            'content': content
        }
        rows.append(row)
    return rows


def write_data(data):
    even_color = '#FFFFFF'
    odd_color = '#D6D6D6'
    title_color = '#FFFFFF'
    question_color = '#BEBEBE'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True, 'constant_memory': True})
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
    question_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': question_color,
        'font_color': 'black',
        'valign': 'vcenter',
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

    odd_line_style = base_answer_style.copy()
    odd_line_style['bg_color'] = odd_color
    odd_line_format = workbook.add_format(odd_line_style)

    even_line_style = base_answer_style.copy()
    even_line_style['bg_color'] = even_color
    even_line_format = workbook.add_format(even_line_style)

    def get_format_for_color_code(wb, base_style_dict, color_code):
        colored_style = base_style_dict.copy()
        colored_style['bg_color'] = get_color_hex_from_code(color_code)
        return wb.add_format(colored_style)

    start_row = 0
    start_col = 0
    worksheet.set_column(0, 512, 30)
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
        elif line.get('type') == 'question':
            for point in line.get('content'):
                worksheet.write(row, col, point, question_format)
                col += 1
        elif line.get('type') == 'answer':
            for cell in line.get('content'):
                if cell.get('color_code') is not 0:
                    worksheet.write(row, col, cell.get('value'),
                                    get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
                elif line_counter == 0:
                    worksheet.write(row, col, cell.get('value'), even_line_format)
                else:
                    worksheet.write(row, col, cell.get('value'), odd_line_format)
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
