import xlsxwriter
import io
from typing import Iterable
from django.db.transaction import atomic

from audit.service import audit_cycle as audit_cycle_service
from audit.models import AuditCycle
from questionnaire.service import section as section_service

from questionnaire.models.question import Question
from questionnaire.models.section import Section
from questionnaire.models.questionnaire import Industry, ProblemStatement, SampleQuestionnaire, SampleQuestionnaireType

from kronos.exceptions import AppLogicError
from django.contrib.staticfiles import finders
import openpyxl

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

def import_questionnaire(file_obj, audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)

    if Section.objects.filter(audit_cycle=audit_cycle).exists():
        raise Exception("This audit cycle already has sections or questions. Import not allowed.")

    wb = openpyxl.load_workbook(file_obj)
    ws = wb.active

    allowed_question_types = ["PLAIN", "MUTEX", "MULTISELECT"]
    required_option_keys = {"sequence", "value", "marks"}

    sections_data = []
    questions_data = []
    current_section = None
    section_sequences = set()
    section_question_sequences = {}

    for row in ws.iter_rows(min_row=2, values_only=True):
        sequence = row[0]
        text = row[1]
        max_marks = row[2]
        q_type = row[3] if len(row) > 3 else None
        q_options = row[4] if len(row) > 4 else None
        impact_factors = row[5] if len(row) > 5 else ""
        hide_question = bool(row[6]) if len(row) > 6 else False
        optional_comment_required = bool(row[7]) if len(row) > 7 else False

        if sequence is None:
            raise Exception("Missing sequence number in row with text '%s'." % text)

        try:
            sequence = int(sequence)
        except ValueError:
            raise Exception("Invalid sequence '%s' in row with text '%s'." % (sequence, text))

        if not q_type:
            if not text:
                raise Exception("Section name missing for sequence %s." % sequence)
            if sequence in section_sequences:
                raise Exception("Duplicate section sequence found: %s\n Section name: %s" % (sequence, text))
            section_sequences.add(sequence)
            current_section = {"sequence": sequence, "name": text.strip()}
            sections_data.append(current_section)
            continue

        if current_section is None:
            raise Exception("Question '%s' found before any section definition." % text)

        sec_seq = current_section['sequence']
        if sec_seq not in section_question_sequences:
            section_question_sequences[sec_seq] = set()

        if sequence in section_question_sequences[sec_seq]:
            raise Exception("Duplicate question sequence %s found in section '%s'." % (sequence, current_section['name']))
        section_question_sequences[sec_seq].add(sequence)

        if q_type not in allowed_question_types:
            raise Exception("Section %s : Question %s : Invalid question type '%s'" % (current_section['sequence'], sequence, q_type))

        question_data = {
            "sequence": sequence,
            "text": text.strip(),
            "max_marks": int(max_marks or 0),
            "question_type": q_type,
            "impact_factors": [impact_factors] if impact_factors else [],
            "hide_question": hide_question,
            "optional_comment_required": optional_comment_required,
            "options": [],
        }

        if q_type in ["MUTEX", "MULTISELECT"]:
            total_option_marks = 0
            option_marks_list = []

            if q_options:
                for line in str(q_options).split("\n"):
                    option_dict = {}
                    for part in line.split(","):
                        if ":" not in part:
                            continue
                        key, value = part.split(":", 1)
                        key = key.strip().lower()
                        value = value.strip()

                        if key == "value":
                            if value != value.strip():
                                raise Exception( "Section %s : Question %s : Option '%s' has leading/trailing spaces." % (current_section["sequence"], sequence, value) )
                            value = value.strip()

                        if key in ["marks", "sequence"]:
                            try:
                                value = int(value)
                            except ValueError:
                                value = 0
                        option_dict[key] = value

                    if set(option_dict.keys()) != required_option_keys:
                        raise Exception( "Section %s : Question %s : Option keys mismatch. Found %s." % (current_section['sequence'], sequence, list(option_dict.keys())) )

                    question_data["options"].append(option_dict)
                    option_marks_list.append(option_dict["marks"])
                    total_option_marks += int(option_dict["marks"])

            if q_type == "MULTISELECT" and total_option_marks != question_data["max_marks"]:
                raise Exception( "Section %s : Question %s : Marks mismatch." % (current_section["sequence"], sequence) )
            
            elif q_type == "MUTEX" and option_marks_list:
                highest = max(option_marks_list)
                if highest != question_data["max_marks"]:
                    raise Exception( "Section %s : Question %s : Marks mismatch." % (current_section["sequence"], sequence) )

        questions_data.append((current_section, question_data))

    sorted_sections = sorted(section_sequences)
    expected_sections = list(range(1, len(sorted_sections) + 1))
    if sorted_sections != expected_sections:
        raise Exception( "Section sequences invalid: found %s, expected consecutive sequence %s." % (sorted_sections, expected_sections) )

    created_sections = {}
    created_questions = []

    for sec_data, ques_data in questions_data:
        sec_key = sec_data["sequence"]
        if sec_key not in created_sections:
            section_obj = Section.objects.create(
                audit_cycle=audit_cycle,
                sequence=sec_data["sequence"],
                name=sec_data["name"],
            )
            created_sections[sec_key] = section_obj
        else:
            section_obj = created_sections[sec_key]

        question_obj = Question.objects.create(
            section=section_obj,
            sequence=ques_data["sequence"],
            question_txt=ques_data["text"],
            max_marks=ques_data["max_marks"],
            question_type=ques_data["question_type"],
            question_data={
                "version": 1,
                "impact_factors": ques_data["impact_factors"],
                "options": ques_data["options"],
            },
            hide_question=ques_data["hide_question"],
            optional_comment_required=ques_data["optional_comment_required"],
        )
        created_questions.append(question_obj)

    return {
        "sections": len(created_sections),
        "questions": len(created_questions),
    }

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

def find_sample_xlsx_for_questionnaire_insert():
    import io
    import xlsxwriter

    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet("Questionnaire Sample")

    # Formats
    header_format = workbook.add_format({'bold': True, 'bg_color': '#D7E4BC', 'border': 1, 'align': 'center', 'valign': 'vcenter'})
    section_format = workbook.add_format({'bold': True, 'bg_color': '#FCE4D6', 'border': 1, 'align': 'left'})
    normal_format = workbook.add_format({'border': 1})
    center_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'vcenter'})
    wrap_format = workbook.add_format({'border': 1, 'text_wrap': True, 'valign': 'top'})

    # Sample data
    sample_data = [
        ["Sequence", "Question/Section", "Max Marks", "Question Type", "Question Options", "Impact Factors", "Hide Question", "Optional comment required?"],
        [1, "section 1", "", "", "", "", "", ""],
        [1, "question 11", 5, "PLAIN", "", "impact factor text", "", ""],
        [2, "multiple", 1, "MULTISELECT",
         "sequence: 1, value: Yes, marks: 1\nsequence: 2, value: No, marks: 0",
         "", "", "TRUE"],
        [2, "question 2", 5, "PLAIN", "", "", "", ""],
        [3, "question 3", 5, "PLAIN", "", "", "", ""],
        [4, "question 4", 1, "MUTEX",
         "sequence: 1, value: Yes, marks: 1\nsequence: 2, value: No, marks: 0",
         "", "", ""],
        [5, "question 5", 2, "MUTEX",
         "sequence: 1, value: Yes, marks: 1\nsequence: 2, value: No, marks: 0\nsequence: 3, value: other, marks: 1",
         "", "", ""],
        [6, "question 6", 8, "MULTISELECT",
         "sequence: 1, value: Yes, marks: 6\nsequence: 2, value: No, marks: 0\nsequence: 3, value: other, marks: 2",
         "impact factor text", "", "TRUE"],
        [2, "section 2", "", "", "", "", "", ""],
        [1, "question 1", 5, "PLAIN", "", "", "", ""],
        [3, "section 3", "", "", "", "", "", ""],
        [1, "question 1", 5, "PLAIN", "", "", "", "TRUE"],
        [4, "section 4", "", "", "", "", "", ""],
        [1, "question 1", 5, "MUTEX",
         "sequence: 1, value: Yes, marks: 5\nsequence: 2, value: No, marks: 0",
         "", "", ""],
    ]

    # Set column widths
    worksheet.set_column(0, 0, 10)
    worksheet.set_column(1, 1, 35)
    worksheet.set_column(2, 2, 12)
    worksheet.set_column(3, 3, 15)
    worksheet.set_column(4, 4, 40)
    worksheet.set_column(5, 5, 25)
    worksheet.set_column(6, 7, 25)

    # Write data
    for row_num, row_data in enumerate(sample_data):
        for col_num, cell_value in enumerate(row_data):
            if row_num == 0:
                worksheet.write(row_num, col_num, cell_value, header_format)
            elif isinstance(cell_value, str) and row_data[3] == "" and col_num == 1:  # section row
                worksheet.write(row_num, col_num, cell_value, section_format)
            elif col_num == 4 and cell_value:  # question options (wrap text)
                worksheet.write(row_num, col_num, cell_value, wrap_format)
            else:
                worksheet.write(row_num, col_num, cell_value, center_format)

    workbook.close()
    output.seek(0)
    name = "Sample_Questionnaire.xlsx"
    return output, name
