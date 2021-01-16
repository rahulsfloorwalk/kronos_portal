from audit_store import service as audit_store_service
from answer.service import answer as answer_service
from questionnaire.models import Question
from ..models import Answer

def find_by_audit_store_and_question_for_auditor(audit_store_id, question_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return answer_service.find_by_audit_store_and_question(audit_store.id, question_id)


def add_multiselect_answer_questions(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    multi_select_question = Question.objects.filter(section__audit_cycle__id=audit_store.audit.audit_cycle.id,
                                                    question_type=Question.MULTISELECT)
    for question in multi_select_question:
        if not Answer.objects.filter(audit_store__id=audit_store_id, question__id=question.id).exists():
            answer = Answer()
            answer.question = question
            answer.audit_store = audit_store
            answer.answer_text = ""
            answer.answer_text_original = ""
            answer.marks_obtained = 0
            answer.save()
