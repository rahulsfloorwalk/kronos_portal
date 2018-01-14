import xlsxwriter
import io
from audit.service import audit_cycle as audit_cycle_service


def export_questionnaire(audit_cycle_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    sections = audit_cycle.sections.order_by('sequence')

    questions = []
    for section in sections:
        questions.extend(section.questions.order_by('sequence'))

    data = create_text_structure(sections, questions)
    name = (str(audit_cycle.name) + "_questionnaire.xlsx").replace("-", "")
    return write_data(data), name

def create_text_structure(sections, questions):
    rows = []
    row = {
        'type': 'header',
        'text_arr': ['Sequence','Question/Section', 'Max Marks']
    }
    rows.append(row)
    for section in sections:
        row = {
            'type': 'section',
            'text': section.name,
            'max_marks': section.max_marks(),
            'sequence': section.sequence
        }
        rows.append(row)
        for question in questions:
            if question.section == section:
                row = {
                    'type': 'question',
                    'text': question.question_txt,
                    'max_marks': question.max_marks,
                    'sequence': question.sequence
                }
                rows.append(row)

    return rows

def write_data(data):
    even_color = '#FFFFFF'
    odd_color = '#D6D6D6'
    header_color = '#FFFFFF'
    section_color = '#FFFFBF'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    header_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'font_size': 16,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': header_color,
        'font_color': 'black',
        'valign': 'vcenter',
    })
    section_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': section_color,
        'font_color': 'red',
        'valign': 'vcenter',
        'font_size': 12,
    })
    base_question_style = {
        'text_wrap': True,
        'bottom': 1,
        'right': 1,
        'font_color': 'black',
        'valign': 'vcenter',
        'font_size': 12,
    }

    odd_line_style = base_question_style.copy()
    odd_line_style['bg_color'] = odd_color
    odd_line_format = workbook.add_format(odd_line_style)

    even_line_style = base_question_style.copy()
    even_line_style['bg_color'] = even_color
    even_line_format = workbook.add_format(even_line_style)

    start_row = 0
    start_col = 0
    worksheet.set_column(0, 0, 20)
    worksheet.set_column(1, 1, 50)
    worksheet.set_column(2, 2, 20)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'header':
            for text in line.get('text_arr'):
                worksheet.write(row, col, text, header_format)
                col += 1
        elif line.get('type') == 'section':
            row += 1
            worksheet.write(row, col, line.get('sequence'), section_format)
            worksheet.write(row, col + 1, line.get('text'), section_format)
            worksheet.write(row, col + 2, line.get('max_marks'), section_format)
        elif line.get('type') == 'question':
            if line_counter:
                curr_format = even_line_format
            else:
                curr_format = odd_line_format
            worksheet.write(row, col, line.get('sequence'), curr_format)
            worksheet.write(row, col + 1, line.get('text'), curr_format)
            worksheet.write(row, col + 2, line.get('max_marks'), curr_format)

        line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
