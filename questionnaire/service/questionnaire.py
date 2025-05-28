import xlsxwriter
import io
from typing import Iterable
from django.db.transaction import atomic

from audit.service import audit_cycle as audit_cycle_service
from questionnaire.service import section as section_service

from questionnaire.models.question import Question
from questionnaire.models.section import Section
from questionnaire.models.questionnaire import Industry, ProblemStatement, SampleQuestionnaire, SampleQuestionnaireType

from kronos.exceptions import AppLogicError
from django.contrib.staticfiles import finders


def export_questionnaire(audit_cycle_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    sections = audit_cycle.sections.order_by('sequence')

    questions = []
    for section in sections:
        questions.extend(section.questions.order_by('sequence'))

    data = create_text_structure(sections, questions)
    name = (str(audit_cycle.name) + "_questionnaire.xlsx").replace("-", "")
    return write_data(data,audit_cycle.name), name

def create_text_structure(sections, questions):
    rows = []
    row = {
        'type': 'header',
        'text_arr': ['Sequence', 'Question/Section', 'Max Marks', 'Question Type', 'Question Options']
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
                question_option = ""
                if question.question_type in ['MUTEX', 'MULTISELECT']:
                    for qo in question.question_data['options']:
                        question_option = question_option + "sequnce: " + str(qo['sequence']) + ", option: " + str(qo['value']) + ", marks: " + str(qo['marks']) + "\n"
                row = {
                    'type': 'question',
                    'text': question.question_txt,
                    'max_marks': question.max_marks,
                    'sequence': question.sequence,
                    'question_type': question.question_type,
                    'question_option': question_option
                }
                rows.append(row)

    return rows

def write_data(data, audit_cycle_name=""):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()

    worksheet.set_column(0, 0, 20)
    worksheet.set_column(1, 1, 50)
    worksheet.set_column(2, 2, 20)
    worksheet.set_column(3, 3, 20)
    worksheet.set_column(4, 4, 40)

    worksheet.set_row(0, 70)
    worksheet.set_row(1, 30)

    worksheet.merge_range(0, 0, 0, 4, '')

    logo_path = finders.find('registration/logo_500x300.png') 

    with open(logo_path, 'rb') as f:
        logo_image = io.BytesIO(f.read())

    worksheet.insert_image('A1', 'logo.png', {
        'image_data': logo_image,
        'x_offset': 480,   # tweak this to center horizontally
        'y_offset': 5,
        'x_scale': 0.27,   # adjust size to fit nicely
        'y_scale': 0.27,
        'positioning': 1
    })

    title_format = workbook.add_format({
        'bold': True,
        'font_size': 18,
        'align': 'center',
        'valign': 'vcenter'
    })
    worksheet.merge_range(1, 0, 1, 4, 'Audit - Questionnaire (' + audit_cycle_name + ')', title_format)

    worksheet.set_default_row(40)

    header_color = '#FFFFFF'
    section_color = '#FFFFBF'
    even_color = '#FFFFFF'
    odd_color = '#D6D6D6'

    header_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'font_size': 14,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': header_color,
        'font_color': 'black',
        'valign': 'vcenter',
        'align': 'left'
    })

    section_left = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': section_color,
        'font_color': 'red',
        'valign': 'vcenter',
        'font_size': 12,
        'align': 'left'
    })
    section_center = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': section_color,
        'font_color': 'red',
        'valign': 'vcenter',
        'font_size': 12,
        'align': 'center'
    })
    base_question_style = {
        'text_wrap': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'font_color': 'black',
        'valign': 'vcenter',
        'font_size': 12,
    }

    odd_line_left = workbook.add_format({**base_question_style, 'bg_color': odd_color, 'align': 'left'})
    even_line_left = workbook.add_format({**base_question_style, 'bg_color': even_color, 'align': 'left'})

    odd_line_center = workbook.add_format({**base_question_style, 'bg_color': odd_color, 'align': 'center'})
    even_line_center = workbook.add_format({**base_question_style, 'bg_color': even_color, 'align': 'center'})

    row = 2
    col = 0
    line_counter = 0
    for line_data in data:
        if line_data.get('type') == 'header':
            c = col
            for text in line_data.get('text_arr'):
                worksheet.write(row, c, text, header_format)
                c += 1
            worksheet.set_row(row, 40)  # fixed header height
        elif line_data.get('type') == 'section':
            # row += 1
            # Section sequence and max marks centered
            worksheet.write(row, col, line_data.get('sequence'), section_center)
            worksheet.write(row, col + 1, line_data.get('text'), section_left)
            worksheet.write(row, col + 2, line_data.get('max_marks'), section_center)
            worksheet.set_row(row, 30)  # section row height fixed
        elif line_data.get('type') == 'question':
            q_options = line_data.get('question_option') or ''
            line_count = q_options.count('\n') + 1
            height = max(30, line_count * 18)  # approx height

            is_even = (line_counter % 2 == 0)

            left_format = even_line_left if is_even else odd_line_left
            center_format = even_line_center if is_even else odd_line_center

            worksheet.write(row, col, line_data.get('sequence'), center_format)        # sequence centered
            worksheet.write(row, col + 1, line_data.get('text'), left_format)          # question text left aligned
            worksheet.write(row, col + 2, line_data.get('max_marks'), center_format)   # max marks centered
            worksheet.write(row, col + 3, line_data.get('question_type'), center_format) # question type centered
            worksheet.write(row, col + 4, q_options, left_format)                      # question options left aligned

            worksheet.set_row(row, height)
            line_counter += 1
        row += 1

    workbook.close()
    output.seek(0)
    return output


def get_industry_list() -> Iterable[Industry]:
    """Get industry lists (Industry)"""
    return Industry.objects.all()

def get_industry_by_id(industry_id: int) -> Industry:
    try:
        industry = Industry.objects.get(id = industry_id)
    except Industry.DoesNotExist:
        raise AppLogicError("Industry not found")
    return industry


def get_problem_statement_by_industry(industry_id: int) -> Iterable[ProblemStatement]:
    """ Get problem statements by industry """

    return ProblemStatement.objects.filter(industry_id = industry_id)


def get_problem_statement_by_id(problem_statement_id: int) -> ProblemStatement:
    try:
        problem_statement = ProblemStatement.objects.get(id = problem_statement_id)
    except ProblemStatement.DoesNotExist:
        raise AppLogicError("Problem statement not found")
    return problem_statement


def find_sample_questionnaire_type_by_problem_statement(problem_statement_id: int) -> Iterable[SampleQuestionnaireType]:
    """Get sample questionnaire types by problem statement"""

    return SampleQuestionnaireType.objects.filter(problem_statement_id = problem_statement_id)


def get_sample_questionnaire_type_by_id(sample_questionnaire_type_id: int) -> SampleQuestionnaireType:
    try:
        sample_questionnaire_type = SampleQuestionnaireType.objects.get(id = sample_questionnaire_type_id)
    except SampleQuestionnaireType.DoesNotExist:
        raise AppLogicError("Sample questionnaire type not found")
    return sample_questionnaire_type


def find_sample_questionnaire_by_questionnaire_type(questionnnaire_type_id: int) -> SampleQuestionnaire:
    """Get sample questionnaire by questionnaire type"""
    try:
        questionnaire = SampleQuestionnaire.objects.get(sample_questionnaire_type_id = questionnnaire_type_id)
    except SampleQuestionnaire.DoesNotExist as e:
        raise AppLogicError('Sample questionnaire not found')

    return questionnaire


def find_sample_questionnaire_by_id(sample_questionnaire_id):
    try:
        questionnaire = SampleQuestionnaire.objects.get(id = sample_questionnaire_id)
    except SampleQuestionnaire.DoesNotExist as e:
        raise AppLogicError('Sample questionnaire not found')

    return questionnaire


@atomic
def insert_sample_questionnaire_to_audit_cycle(audit_cycle_id, sample_questionnaire_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    sample_questionnaire = find_sample_questionnaire_by_id(sample_questionnaire_id)

    is_created = section_service.find_by_audit_cycle(audit_cycle_id).exists()
    if is_created:
        raise AppLogicError("Questionnaire is already created")

    if not sample_questionnaire.questionnaire_data:
        raise AppLogicError("Invalid sample questionnaire")

    if 'questionnaire' not in sample_questionnaire.questionnaire_data:
        raise AppLogicError("Sample questionnaire not found")

    questionnaire = sample_questionnaire.questionnaire_data['questionnaire']
    for section in questionnaire:
        section_obj = Section()
        section_obj.name = section['name']
        section_obj.sequence = section['sequence']
        section_obj.audit_cycle = audit_cycle
        section_obj.save()

        for question in section['questions']:
            question_obj = Question()
            question_obj.question_txt = question['question_txt']
            question_obj.max_marks = question['max_marks']
            question_obj.question_type = question['question_type']
            question_obj.question_data = question['question_data']
            question_obj.sequence = question['sequence']
            question_obj.section = section_obj
            question_obj.save()