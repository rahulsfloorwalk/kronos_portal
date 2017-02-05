from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError, ObjectNotFound
from ..models import Answer
from audit_store.models import AuditStore
from questionnaire.models import Question
from auditor.models import ProfileInfo

def save(answer):
    Answer.save(answer)
    return answer

def submit_answer(audit_store_id, question_id, user_id, answer_text):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        question = Question.objects.get(pk=question_id)
    except (AuditStore.DoesNotExist, Question.DoesNotExist) as e:
        raise ObjectNotFound() from e
    if user_id == audit_store.user_id:
        try:
            answer = Answer.objects.get(audit_store_id=audit_store_id, question_id=question_id)
        except Answer.DoesNotExist:
            answer = Answer()
            answer.question = question
            answer.audit_store = audit_store
        answer.answer_text = answer_text
        return save(answer)
    else:
        raise ObjectNotFound()

#def get_answers(audit_store_id, user_id):
