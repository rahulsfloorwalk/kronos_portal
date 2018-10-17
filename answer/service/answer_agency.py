from django.db.transaction import atomic

from kronos.exceptions import AppLogicError
from audit_store import service_agency as audit_store_service
from answer.service import answer as answer_service


def find_by_audit_store_for_agency(audit_store_id, user_id):

    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return answer_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return answer_service.find_by_audit_store_and_question(audit_store.id, question_id)


def set_answer_comment_by_agency(audit_store_id, question_id, user_id, answer_comment):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    if audit_store.is_editable_by_agency():
        answer = find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id)
        answer.set_answer_comment(answer_comment)
        return answer
    else:
        raise AppLogicError("Cannot submit answer comment to current audit store")


@atomic
def submit_answer_by_agency(audit_store_id, question_id, user_id, answer_text):
    audit_store = audit_store_service.find_by_id_for_agency_user(audit_store_id, user_id)
    if audit_store.is_editable_by_agency():
        answer = find_by_audit_store_and_question_for_agency(audit_store_id, question_id, user_id)
        answer.set_answer_text(answer_text)
        answer.copy_answer_text_original()
        return answer
    else:
        raise AppLogicError("Cannot submit answer to current audit store")
