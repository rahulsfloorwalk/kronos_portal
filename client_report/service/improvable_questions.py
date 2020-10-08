import xlsxwriter
import io

from django.db.models import Sum
from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.service.question import find_by_audit_cycle
from answer.service.answer import find_answers_by_question_id
from kronos.utils import get_color_code, get_color_hex_from_code


def get_improvable_questions_by_audit_cycle(audit_cycle_id, questionnaire_type_id):
    improvable_questions_list = []
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    questions_list = find_by_audit_cycle(audit_cycle_obj.id)
    for question in questions_list:
        if question.max_marks > 0:
            answer_obj = find_answers_by_question_id(question.id)
            answer_obj = answer_obj.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                           not_applicable=False)
            if answer_obj.count() > 0:
                total_question_marks = question.max_marks * answer_obj.count()
                obtained_marks = (answer_obj.aggregate(sum_marks=Sum('marks_obtained')))['sum_marks']
                percentage = (obtained_marks / total_question_marks) * 100
                if percentage < 75:
                    improvable_questions_dict = {}
                    improvable_questions_dict['question_id'] = question.id
                    improvable_questions_dict['question_txt'] = question.question_txt
                    improvable_questions_dict['question_section'] = question.section.name
                    improvable_questions_dict['total_marks'] = total_question_marks
                    improvable_questions_dict['obtained_marks'] = obtained_marks
                    improvable_questions_dict['lost_marks'] = total_question_marks - obtained_marks
                    improvable_questions_dict['percentage'] = percentage
                    improvable_questions_list.append(improvable_questions_dict)

    return sorted(improvable_questions_list, key=lambda qd: qd['lost_marks'], reverse=True)


def get_improvable_questions_xlsx_by_audit_cycle(audit_cycle_id, questionnaire_type_id):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    improvable_questions_data = get_improvable_questions_by_audit_cycle(audit_cycle_id, questionnaire_type_id)
    data = create_text_structure(audit_cycle_obj.name, improvable_questions_data)
    name = (str(audit_cycle_obj.name) + " Improvable Questions List" + ".xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(audit_cycle_name, improvable_questions_data):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [audit_cycle_name + ' Improvable Questions']}
    rows.append(row)

    # generate header of improvable questions
    cells = [{'value': "Section"}, {'value': "Question"}, {'value': "Obtained Marks / Total Marks"},
             {'value': "Marks Lost"}]
    row = {'type': 'header', 'content': cells}
    rows.append(row)

    # generate improvable question rows
    for question in improvable_questions_data:
        question_section = {
            'value': question['question_section'],
            'color_code': get_color_code(0, 0)
        }
        question_txt = {
            'value': question['question_txt'],
            'color_code': get_color_code(0, 0)
        }
        marks = {
            'value': str(question['obtained_marks']) + " / " + str(question['total_marks']),
            'color_code': get_color_code(0, 0)
        }
        marks_lost = {
            'value': question['lost_marks'],
            'color_code': get_color_code(question['percentage'], 100)
        }
        content = [question_section, question_txt, marks, marks_lost]
        row = {
            'type': 'question_data',
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
        elif line.get('type') == 'header':
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
        elif line.get('type') == 'question_data':
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
