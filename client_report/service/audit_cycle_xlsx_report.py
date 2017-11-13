import io

import xlsxwriter

from django.db.models import Prefetch

import audit.service.audit_cycle as audit_cycle_service
from client.service.client_user import find_clientuser_by_user_id
from kronos.utils import get_color_code, get_color_hex_from_code
from manager.models import City
from audit_store.models import AuditStore
from questionnaire.models import Question


# Get report for all stores for given client
# ----------------------------------------
def get_aggregate_report_for_manager(audit_cycle_id, filter_user=None):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    sections = audit_cycle.sections.order_by('sequence').prefetch_related(
        Prefetch('questions', queryset=Question.objects.order_by('section__sequence','sequence')),
    )

    questions = []
    for section in sections.questions:
        questions.extend(section.questions.all())

    qs = AuditStore.objects.filter(audit__audit_cycle=audit_cycle).presentable()
    if filter_user:
        qs = qs.visible_to(filter_user)
    qs.order_by('audit_date')

    data = create_text_structure(audit_cycle.name, sections, questions, qs)
    name = (str(audit_cycle.name) + ".xlsx").replace("-", "")
    return write_data(data), name


def get_aggregate_report_for_clientuser(audit_cycle_id, user_id):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, user_id)
    clientuser = find_clientuser_by_user_id(user_id)
    return get_aggregate_report_for_manager(audit_cycle.id, clientuser)


# ----------------------------------------

# Get report for audit cycle client with filters
def get_aggregate_report_with_filters(audit_cycle_id, user_id, filters):
    audit_cycle = audit_cycle_service.find_by_id_for_clientuser(audit_cycle_id, user_id)
    clientuser = find_clientuser_by_user_id(user_id)

    sections = audit_cycle.sections.order_by('sequence').prefetch_related(
        Prefetch('questions', queryset=Question.objects.order_by('section__sequence','sequence')),
    )

    city_name = ''

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
            'audit__store__location',
            'audit__store__location__city',
            'answers',
            'report_sections',
        )

    filtered_audit_stores = audit_stores
    ignored_filters = ['', 'undefined', None]
    if filters.get('city') not in ignored_filters:
        city_name = City.objects.get(pk=int(filters.get('city'))).name
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.location.city.id == int(filters.get('city'))]
    if filters.get('type') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.type == filters.get('type')]
    if filters.get('priority') not in ignored_filters:
        filtered_audit_stores = [x for x in filtered_audit_stores if
                                 x.audit.store.priority == filters.get('priority')]

    data = create_text_structure(audit_cycle.name, sections, questions, filtered_audit_stores)
    name = (str(audit_cycle.name) + city_name + filters.get('type') + filters.get('priority') + ".xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(title, sections, questions, audit_stores):
    rows = []

    ## generate title row
    row = {'type': 'title', 'content': [title]}
    rows.append(row)

    if len(audit_stores) == 0:
        return rows

    ## generate sections row
    section_cells = []
    for section in sections:
        section_cells.append({
            'value': section.name,
            'colspan': len(section.questions.all())
        })
    cells = [{'value': "SECTIONS", 'colspan': 3}] + section_cells
    row = {'type': 'sections', 'content': cells}
    rows.append(row)

    ## generate questions row
    question_cells = []
    for question in questions:
        question_cells.append(question.question_txt)
    content = ["Store Code", "Store", "Audit Date"] + question_cells
    row = {'type': 'question', 'content': content}
    rows.append(row)

    ## generate answer rows
    for audit_store in audit_stores:
        store_code_cell = {
            'value': audit_store.audit.store.code,
            'color_code': get_color_code(0, 0)
        }
        store_name_cell = {
            'value': audit_store.audit.store.name + " - " + audit_store.audit.store.location.city.name,
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
                answer_cells.append({
                    'value': answer.answer_text,
                    'color_code': get_color_code(answer.marks_obtained, question.max_marks)
                })

        content = [store_code_cell, store_name_cell, audit_date_cell] + answer_cells
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
