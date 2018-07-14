from audit_store import service
from answer.service import answer as answer_service
from kronos.exceptions import AppLogicError


def set_not_applicable_for_manager(audit_store_id, question_id, not_applicable):
    answer = answer_service.find_by_audit_store_and_question(audit_store_id, question_id)
    if answer.audit_store.is_editable_by_manager():
        answer.set_not_applicable(not_applicable)
        return answer
    else:
        raise AppLogicError("Cannot set not applicable now")


def set_answer_comment_for_manager(audit_store_id, question_id, answer_comment):
    answer = answer_service.find_by_audit_store_and_question(audit_store_id, question_id)
    if answer.audit_store.is_editable_by_manager():
        answer.set_answer_comment(answer_comment)
        return answer
    else:
        raise AppLogicError("Answer comment cannot be set now")

def set_answer_text_for_manager(audit_store_id, question_id, answer_text):
    answer = answer_service.find_by_audit_store_and_question(audit_store_id, question_id)
    if answer_text == "":
        raise AppLogicError("answer text cannot be blank")
    if answer.audit_store.is_editable_by_manager():
        answer.set_answer_text(answer_text)
        return answer
    else:
        raise AppLogicError("Answer text cannot be set now")

def set_marks_obtained_for_manager(audit_store_id, question_id, marks_obtained):
    answer = answer_service.find_by_audit_store_and_question(audit_store_id, question_id)
    if answer.audit_store.is_editable_by_manager():
        answer.set_marks_obtained(marks_obtained)
        return answer
    else:
        raise AppLogicError("Answer marks obtained cannot be set now")
