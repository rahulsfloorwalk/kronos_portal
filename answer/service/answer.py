from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError, ObjectNotFound
from ..models import Answer
from audit_store.models import AuditStore
from questionnaire.models import Question
from auditor.models import ProfileInfo

from questionnaire.service import question as question_service

from audit_store import service as audit_store_service
from audit_store import service_client as audit_store_client_service

def save(answer):
    Answer.save(answer)
    return answer

def find_answers_by_question_id(question_id):
    return Answer.objects.filter(question_id=question_id)

def find_by_audit_store_and_question(audit_store_id, question_id):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        question = question_service.find_by_audit_cycle_and_id(audit_store.audit.audit_cycle_id, question_id)
        return Answer.objects.get(audit_store_id=audit_store.id, question_id=question.id)
    except Answer.DoesNotExist as e:
        answer = Answer()
        answer.question=question
        answer.audit_store=audit_store
        answer.save()
        return answer


def find_by_audit_store(audit_store_id):
    return Answer.objects.filter(audit_store_id=audit_store_id)


def submit_answer(audit_store_id, question_id, user_id, answer_text):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if user_id != audit_store.user_id:
        raise ObjectNotFound()

    if audit_store.status != AuditStore.ASSIGNED:
        raise AppLogicError("Cannot submit answer to current audit store")

    answer = find_by_audit_store_and_question(audit_store_id, question_id)
    q = question_service.find_question_by_id(question_id)

    if answer_text and q.question_type == Question.MUTEX:
        result = [o for o in q.question_data["options"] if o["value"] == answer_text]
        if len(result) == 1:
            answer.marks_obtained = result[0]["marks"]
        else:
            raise AppLogicError("invalid answer")

    answer.answer_text = answer_text
    answer.answer_text_original = answer_text
    return save(answer)


def find_by_audit_store_for_auditor(audit_store_id, user_id):

    audit_store = audit_store_service.find_by_id(audit_store_id)

    if user_id != audit_store.user_id:
        raise ObjectNotFound()

    return find_by_audit_store(audit_store.id)


def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return find_by_audit_store(audit_store.id)


def set_marks(audit_store_id, question_id, marks):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("Cannot set Marks for unsubmitted report")

    answer = find_by_audit_store_and_question(audit_store_id, question_id)

    if marks > answer.question.max_marks:
        raise AppLogicError("Marks cannot be greater than {}".format(answer.question.max_marks))

    answer.marks_obtained = marks
    answer.save()
    return answer


def set_answer_text(audit_store_id, question_id, answer_text):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("Cannot set answer for unsubmitted report")

    if answer_text in (None, ""):
        raise AppLogicError("answer cannot be empty")

    answer = find_by_audit_store_and_question(audit_store_id, question_id)
    q = question_service.find_question_by_id(question_id)

    if q.question_type == Question.MUTEX:
        result = [o for o in q.question_data["options"] if o["value"] == answer_text]
        if len(result) == 1:
            answer.marks_obtained = result[0]["marks"]
        else:
            raise AppLogicError("invalid answer")

    answer.answer_text = answer_text
    answer.save()
    return answer


def set_not_applicable(audit_store_id, question_id, not_applicable):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if audit_store.status != AuditStore.SUBMITTED:
        raise AppLogicError("Cannot change answer for unsubmitted report")

    answer = find_by_audit_store_and_question(audit_store_id, question_id)
    answer.not_applicable = not_applicable
    answer.save()
    return answer
