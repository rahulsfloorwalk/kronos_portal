
from ..models import Answer

from questionnaire.service import question as question_service
from audit_store import service_moderator as audit_store_moderator_service
from . import answer as answer_service

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return Answer.objects.filter(audit_store_id=audit_store_id)

def find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id):
    try:
        audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
        question = question_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id, question_id)
        return Answer.objects.get(audit_store_id=audit_store.id, question_id=question.id)
    except Answer.DoesNotExist as e:
        answer = Answer()
        answer.question_id=question.id
        answer.audit_store_id=audit_store.id
        answer.save()
        return answer

def set_answer_text_for_moderator(audit_store_id, question_id, answer_text, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    return answer_service.set_answer_text(audit_store_id, question_id, answer_text)

def set_marks_obtained_for_moderator(audit_store_id, question_id, marks_obtained, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    return answer_service.set_marks(audit_store_id, question_id, marks_obtained)
