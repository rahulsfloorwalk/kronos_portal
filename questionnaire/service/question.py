from django.db.transaction import atomic

from ..models import Question, Section

import answer.service.answer as answer_service

def save(question):
    question.full_clean(exclude=["question_data"])
    Question.save(question)
    return question

def find_question_by_id(id):
    try:
        return Question.objects.get(pk=id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

def delete_question_by_id(id):
    try:
        q = Question.objects.get(pk=question_id)
        if answer_service.find_answers_by_question_id(question_id).count() == 0:
            q.delete()
        else:
            raise AppLogicError("cannot delete question with existing answers")
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

def find_questions_by_section_id(section_id):
    return Question.objects.filter(section_id=section_id).all()

def find_by_audit_cycle(audit_cycle_id):
    questions = Question.objects.filter(section__audit_cycle_id=audit_cycle_id)
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
            new_question.sequence = question.sequence
            new_question.section = to_section
            new_question.save()

        to_section.questions.all()

    except (Section.DoesNotExist) as e:
        raise ObjectNotFound from e

