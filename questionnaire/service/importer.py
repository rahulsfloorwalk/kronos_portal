# FOR SHELL USE
import csv
from django.db.transaction import atomic
from kronos.exceptions import AppLogicError
from questionnaire.models import Section, Question
from questionnaire.service import question as question_service
from questionnaire.service import section as section_service
from audit.models import AuditCycle

@atomic
def upload_questionnaire(filename, audit_cycle_id):
    audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    section_sequence = 1
    question_sequence = 1
    section = None
    with open(filename) as csvfile:
        reader = csv.reader(csvfile)
        questions = list(reader)
        # to_save_questions = []
        # to_save_sections = []
        for question_row in questions:
            if question_row[0] != '':
                section = create_section(section_sequence, question_row[0], audit_cycle)
                # to_save_sections.append(section)
                saved_section = section_service.save(section)
                section_sequence += 1
                question_sequence = 1
            if section is None:
                raise AppLogicError("Line 1 must contain section")
            if question_row[1] != '' and question_row[2] != '':
                question_data = create_question_data(question_row[3:])
                question_type = Question.MUTEX if len(question_data.keys()) > 0 else Question.PLAIN
                question = create_question(question_sequence, question_row[1], question_row[2], saved_section, question_type, question_data)
                # to_save_questions.append(question)
                question_service.save(question)
                question_sequence += 1
            else:
                raise AppLogicError("Question text and Max Marks is Mandatory")
            # for s in to_save_sections:
            #     s.save()
            # for q in to_save_questions:
            #     q.save()




def create_section(sequence, name, audit_cycle):
    section = Section()
    section.sequence = sequence
    section.name = name
    section.audit_cycle = audit_cycle
    # section.save()
    return section

def create_question(sequence, question_txt, max_marks, section, question_type, question_data={}):
    question = Question()
    question.sequence = sequence
    question.question_txt = question_txt
    question.max_marks = int(max_marks)
    question.section = section
    question.question_type = question_type
    question.question_data = question_data
    # question.save()
    return question

def create_question_data(options_list):
    question_data = {
        "options": [],
        "version": 1
    }
    option_sequence = 1
    for value, marks in zip(options_list[::2], options_list[1::2]):
        if value != '' and marks != '':
            option = {
                "value": value,
                "marks": int(marks),
                "sequence": int(option_sequence),
            }
            question_data["options"].append(option)
            option_sequence += 1

    return {} if len(question_data.get("options", [])) == 0 else question_data
