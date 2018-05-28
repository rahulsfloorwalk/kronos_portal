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
