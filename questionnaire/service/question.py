from django.db.utils import IntegrityError
from django.db.transaction import atomic

from kronos.exceptions import AppLogicError, ObjectNotFound

from ..models import Question, Section

def save(question):
    question.full_clean(exclude=["question_data"])
    Question.save(question)
    return question

def find_question_by_id(id):
    try:
        return Question.objects.get(pk=id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

def delete_question_by_id(question_id):
    try:
        q = find_question_by_id(question_id)
        q.delete()
    except IntegrityError as e:
        raise AppLogicError("cannot delete question that already has answers") from e

def find_questions_by_section_id(section_id):
    return Question.objects.filter(section_id=section_id).all()

def find_by_audit_cycle(audit_cycle_id):
    questions = Question.objects.filter(section__audit_cycle_id=audit_cycle_id)
    return questions

def find_impact_factors_by_audit_cycle(audit_cycle_id):
    questions = find_by_audit_cycle(audit_cycle_id)
    impact_factors = []
    for question in questions:
        impact_factors.extend(question.question_data.get('impact_factors', []))
    return list(set(impact_factors))

def find_by_audit_cycle_id_and_impact_factor(audit_cycle_id, impact_factor):
    questions = Question.objects.filter(section__audit_cycle_id=audit_cycle_id).filter(question_data__impact_factors__contains=impact_factor).all()
    return questions

def find_by_audit_cycle_and_id(audit_cycle_id, question_id):
    try:
        return Question.objects.get(section__audit_cycle_id=audit_cycle_id, pk=question_id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def copy_questions_from_to(from_section_id, to_section_id):
    try:
        from_section = Section.objects.get(pk=from_section_id)
        to_section = Section.objects.get(pk=to_section_id)

        for question in from_section.questions.all():
            new_question = Question()
            new_question.question_txt = question.question_txt
            new_question.max_marks = question.max_marks
            new_question.question_type = question.question_type
            new_question.question_data = question.question_data
            new_question.sequence = question.sequence
            new_question.section = to_section
            save(new_question)

        to_section.questions.all()

    except (Section.DoesNotExist) as e:
        raise ObjectNotFound from e

