from kronos.exceptions import ObjectNotFound, AppLogicError

from answer.service import answer as answer_service
from audit_store.models import AuditStore
from audit_store import service as audit_store_service


def find_by_audit_store_for_agency(audit_store_id, user_id):

    audit_store = audit_store_service.find_by_id(audit_store_id)

    if audit_store.status != AuditStore.ACKNOWLEDGED:
        raise AppLogicError("Cannot submit answer to current audit store")

    if user_id != audit_store.user_id:
        raise ObjectNotFound()

    return answer_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)

    if user_id != audit_store.user_id:
        raise ObjectNotFound()

    return answer_service.find_by_audit_store_and_question(audit_store_id, question_id)


def set_answer_comment_by_agency(audit_store_id, question_id, user_id, answer_comment):
    answer = find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id)
    answer.set_answer_comment(answer_comment)
    return answer


def submit_answer_by_agency(audit_store_id, question_id, user_id, answer_text):

    answer = find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id)
    answer.set_answer_text(answer_text)
    answer.set_answer_text_original()
    return answer
