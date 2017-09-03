import xlsxwriter
import io
from audit.service import audit_cycle as audit_cycle_service


def import_questionnaire(audit_cycle_id):
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
    pass

def write_data(data):
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
        'font_color': 'red',
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
        'font_color': 'red',
        'valign': 'vcenter',
    })


    workbook.close()
    output.seek(0)
    return output