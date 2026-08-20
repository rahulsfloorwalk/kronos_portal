from kronos.exceptions import AppLogicError
from answer.models import Answer

from audit_store import service_moderator as audit_store_moderator_service
from . import answer as answer_service

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return Answer.objects.filter(audit_store_id=audit_store.id)

def find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_moderator(audit_store_id, user_id)
    return answer_service.find_by_audit_store_and_question(audit_store.id, question_id)

def find_by_audit_store_and_question_for_auditor(audit_store_id, question_id, user_id):
    audit_store = audit_store_moderator_service.find_by_id_for_auditor(audit_store_id, user_id)
    return answer_service.find_by_audit_store_and_question(audit_store.id, question_id)

def set_answer_text_for_moderator(audit_store_id, question_id, answer_text, user_id, status):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    if answer_text == "":
        raise AppLogicError("answer text cannot be blank")
    if len(answer_text) > 4000:
        raise AppLogicError("answer text cannot exceed 4000 characters")
    if answer.audit_store.is_editable_by_moderator():
        answer.set_answer_text(answer_text, status)
        return answer
    else:
        raise AppLogicError("Answer text cannot be set now")

def set_answer_comment_for_moderator(audit_store_id, question_id, answer_comment, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    if answer.audit_store.is_editable_by_moderator():
        answer.set_answer_comment(answer_comment)
        return answer
    else:
        raise AppLogicError("Answer comment cannot be set now")


def set_answer_revert_message_for_moderator(audit_store_id, question_id, answer_revert_message, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    if answer.audit_store.is_editable_by_moderator():
        answer.set_answer_revert_message(answer_revert_message)
        return answer
    else:
        raise AppLogicError("Answer revert message cannot be set now")


def set_marks_obtained_for_moderator(audit_store_id, question_id, marks_obtained, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    if answer.audit_store.is_editable_by_moderator():
        answer.set_marks_obtained(marks_obtained)
        return answer
    else:
        raise AppLogicError("Answer marks obtained cannot be set now")


def set_not_applicable_for_moderator(audit_store_id, question_id, not_applicable, user_id):
    answer = find_by_audit_store_and_question_for_moderator(audit_store_id, question_id, user_id)
    if answer.audit_store.is_editable_by_moderator():
        answer.set_not_applicable(not_applicable)
        return answer
    else:
        raise AppLogicError("Cannot set not applicable now")

def set_not_applicable_for_auditor(audit_store_id, question_id, not_applicable, user_id):
    answer = find_by_audit_store_and_question_for_auditor(audit_store_id, question_id, user_id)
    if answer.audit_store.is_editable_by_auditor():
        answer.set_not_applicable(not_applicable)
        return answer
    else:
        raise AppLogicError("Cannot set not applicable now")
