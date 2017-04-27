from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError, ObjectNotFound
from ..models import Answer
from audit_store.models import AuditStore
from questionnaire.models import Question
from auditor.models import ProfileInfo
from audit_store import service as audit_store_service

def save(answer):
    Answer.save(answer)
    return answer

def submit_answer(audit_store_id, question_id, user_id, answer_text):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        if(audit_store.status != AuditStore.ASSIGNED):
            raise AppLogicError("Cannot submit answer to current audit store")
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
        answer.answer_text_original = answer_text
        return save(answer)
    else:
        raise ObjectNotFound()

def get_answers(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound() from e
    if user_id == audit_store.user_id:
        answers = Answer.objects.filter(audit_store_id=audit_store_id)
        return answers
    else:
        raise ObjectNotFound()


def find_by_audit_store_for_client(audit_store_id, client_id):
    audit_store = audit_store_service.find_by_id_for_client(audit_store_id, client_id)
    return Answer.objects.filter(audit_store_id=audit_store_id)

def set_marks(audit_store_id, question_id, marks):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("Cannot set Marks for unsubmitted report")

    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

    if marks > question.max_marks:
        raise AppLogicError("Marks cannot be greater than {}".format(question.max_marks))
    try:
        answer = Answer.objects.get(audit_store_id= audit_store_id, question_id=question_id)
    except Answer.DoesNotExist as e:
        answer = Answer()
        answer.question_id=question_id
        answer.audit_store_id=audit_store_id

    answer.marks_obtained = marks
    answer.save()
    return answer

def set_answer_text(audit_store_id, question_id, answer_text):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("Cannot set answer for unsubmitted report")

    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e

    if answer_text in (None, ""):
        raise AppLogicError("answer cannot be empty")
    try:
        answer = Answer.objects.get(audit_store_id=audit_store_id, question_id=question_id)
    except Answer.DoesNotExist as e:
        answer = Answer()
        answer.question_id=question_id
        answer.audit_store_id=audit_store_id

    answer.answer_text = answer_text
    answer.save()
    return answer
