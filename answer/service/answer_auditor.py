from audit_store import service as audit_store_service
from answer.service import answer as answer_service

def find_by_audit_store_and_question_for_auditor(audit_store_id, question_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    return answer_service.find_by_audit_store_and_question(audit_store.id, question_id)
