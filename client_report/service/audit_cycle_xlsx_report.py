import xlsxwriter
import io

from kronos.utils import get_color_code, get_color_hex_from_code
from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question

def get_aggregate_report_for_manager(audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client.id
    return get_aggregate_report_for_client(audit_cycle_id, client_id)

def get_aggregate_report_for_client(audit_cycle_id, client_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

    valid_client = audit_cycle.client
    if(valid_client.id == int(client_id)):
        sections = audit_cycle.sections.order_by('sequence')

        questions = []
        for section in sections:
            questions.extend(section.questions.order_by('sequence'))

        audit_stores = []
        for audit in audit_cycle.audits.all():
            audit_store = audit.audit_stores.presentable().order_by('audit_date')
            audit_stores.extend(audit_store)

        data = create_text_structure(audit_cycle.name, sections, questions, audit_stores)
        name = (str(audit_cycle.name) + ".xlsx").replace("-", "")
        return write_data(data), name

    else:
        raise AppLogicError("Invalid Client")

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
            'colspan': section.questions.count()
        })
    cells = [{'value':"SECTIONS",'colspan':2}] + section_cells
    row = {'type': 'sections', 'content': cells}
    rows.append(row)

    ## generate questions row
    question_cells = []
    for question in questions:
        question_cells.append(question.question_txt)
    content = ["Store", "Audit Date"] + question_cells
    row = {'type': 'question', 'content': content}
    rows.append(row)

    ## generate answer rows
    for audit_store in audit_stores:
        store_name_cell = {
            'value': audit_store.audit.store.name + " - "+ audit_store.audit.store.location.city.name,
            'color_code': get_color_code(0,0)
        }
        audit_date_cell = {
            'value': audit_store.audit_date.strftime('%d-%m-%Y'),
            'color_code': get_color_code(0,0)
        }

        answer_cells = []
        for question in questions:
            try:
                answer = audit_store.answers.get(question_id=question.id)
                store = answer.audit_store
                section = question.section
                report_section = ReportSection.objects.get(audit_store=store, section=section)
                if report_section.not_applicable:
                    answer_cells.append({
                        'value': "Not Applicable",
                        'color_code': get_color_code(0,0)
                    })
                elif answer.not_applicable:
                    answer_cells.append({
                        'value': "Not Applicable",
                        'color_code': get_color_code(0, 0)
                    })
                else:
                    answer_cells.append({
                        'value': answer.answer_text,
                        'color_code': get_color_code(answer.marks_obtained, answer.question.max_marks)
                    })
            except (Answer.DoesNotExist) as e:
                answer_cells.append({
                    'value': "",
                    'color_code': get_color_code(0,0)
                })
        content = [store_name_cell, audit_date_cell] + answer_cells
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
    workbook = xlsxwriter.Workbook(output, {'in_memory' : True})
    worksheet = workbook.add_worksheet()
    section_format = workbook.add_format({
        'text_wrap':True,
        'bold':True,
        'top':1,
        'bottom':1,
        'right':1,
        'bg_color': question_color,
        'font_color':'red',
        'valign': 'vcenter',
        'font_size':14,
    })
    question_format = workbook.add_format({
        'text_wrap':True,
        'bold':True,
        'top':1,
        'bottom':1,
        'right':1,
        'bg_color': question_color,
        'font_color':'red',
        'valign': 'vcenter',
    })

    title_format = workbook.add_format({
        'text_wrap':True,
        'bold':True,
        'font_size':16,
        'bottom':1,
        'bg_color': title_color,
        'font_color':'red',
        'valign': 'vcenter',
    })

    base_answer_style = {
        'text_wrap':True,
        'bottom':1,
        'right':1,
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
                worksheet.merge_range(row, col, row, col+3, point, title_format)
                col += 1
        elif line.get('type') == 'sections':
            for cell in line.get('content'):
                if isinstance(cell, dict):
                    if cell.get('colspan',1) > 1:
                        worksheet.merge_range(row, col, row, col+cell.get('colspan')-1, cell.get('value'), section_format)
                        col += cell.get('colspan',1)
                    else:
                        worksheet.write(row, col, cell.get('value',""), section_format)
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
                    worksheet.write(row, col, cell.get('value'), get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
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
