import os, json, datetime
from client.models import Client, ClientUser, Store
from manager.models import Location, City
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question, Section
from pprint import pprint

store_id_map = {}
audit_cycle_id_map = {}
question_id_map = {}
section_id_map = {}
def load_data_dump_for_client(client_id):
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/dump.json', "r") as json_data:
        data = json.load(json_data)
        stores_list = data.get('client', {}).get('stores', [])
        audit_cycles_list = data.get('client', {}).get('audit_cycles', [])
        load_stores(client_id, stores_list)
        load_audit_cycles(client_id, audit_cycles_list)

def load_stores(client_id, stores):
    for store_dict in stores:
        store = Store()
        store.code = store_dict.get("code", "")
        store.type = store_dict.get("type", "")
        store.priority = store_dict.get("priority", "")
        store.name = store_dict.get("name", "")
        store.address = store_dict.get("address", "")
        store.location_id = store_dict.get("location", None)
        store.city_id = store_dict.get("city_id", None)
        store.client_id = client_id
        store.phone = store_dict.get("phone", "")
        store.extra_data = store_dict.get("extra_data", {})

        store.save()
        old_store_id = store_dict['id']
        store_id_map[old_store_id] = store.id



def load_audit_cycles(client_id, audit_cycles):
    for audit_cycle_dict in audit_cycles:
        start_date = datetime.datetime.strptime(audit_cycle_dict.get('start_date', ""), "%m/%d/%Y")
        end_date = datetime.datetime.strptime(audit_cycle_dict.get('end_date', ""), "%m/%d/%Y")

        audit_cycle = AuditCycle()
        audit_cycle.name = audit_cycle_dict.get('name', "")
        audit_cycle.type = audit_cycle_dict.get('type', "")
        audit_cycle.status = audit_cycle_dict.get('status', "")
        audit_cycle.start_date = start_date
        audit_cycle.end_date = end_date
        audit_cycle.earnings_per_audit = audit_cycle_dict.get('earnings_per_audit', "")
        audit_cycle.revenue_per_audit = audit_cycle_dict.get('revenue_per_audit', "")
        audit_cycle.reimbursement = audit_cycle_dict.get('reimbursement', "")
        audit_cycle.description = audit_cycle_dict.get('description', "")
        audit_cycle.client_id = client_id
        audit_cycle.post_approval_description = audit_cycle_dict.get('post_approval_description', "")

        audit_cycle.save()
        old_audit_cycle_id = audit_cycle_dict['id']
        audit_cycle_id_map[old_audit_cycle_id] = audit_cycle.id

        load_sections_for_audit_cycle(audit_cycle.id, audit_cycle_dict.get('sections', []))
        load_audits_for_audit_cycle(audit_cycle.id, audit_cycle_dict.get('audits', []))

def load_audits_for_audit_cycle(audit_cycle_id, audits):
    for audit_dict in audits:
        old_store_id = audit_dict['store_id']
        audit = Audit()

        audit.count = audit_dict.get("count", "")
        audit.earnings_per_audit = audit_dict.get("earnings_per_audit", "")
        audit.reimbursement = audit_dict.get("reimbursement", "")
        audit.store_id = store_id_map[old_store_id]
        audit.audit_cycle_id = audit_cycle_id
        audit.post_approval_description = audit_dict.get("post_approval_description", "")
        audit.hidden = audit_dict.get("hidden", False)

        audit.save()
        load_auditstores_for_audits(audit.id, audit_dict.get("audit_stores", []))


def load_auditstores_for_audits(audit_id, reports):
    for auditstore_dict in reports:
        audit_date = datetime.datetime.strptime(auditstore_dict.get('audit_date', ""), "%m/%d/%Y")
        auditstore = AuditStore()
        auditstore.status = auditstore_dict.get("status", "")
        auditstore.audit_date = audit_date
        auditstore.qa_rating = auditstore_dict['qa_rating']
        auditstore.audit_id = audit_id
        auditstore.user_id = auditstore_dict.get("user_id", 1641)
        auditstore.save()
        load_report_sections_for_auditstore(auditstore.id, auditstore_dict.get("report_sections", []))
        load_answers_for_auditstore(auditstore.id, auditstore_dict.get("answers", []))

def load_sections_for_audit_cycle(audit_cycle_id, sections):
    for section_dict in sections:
        section = Section()
        section.name = section_dict.get("name", "")
        section.sequence = section_dict.get("sequence", 1)
        section.audit_cycle_id = audit_cycle_id

        section.save()
        old_section_id = section_dict['id']
        section_id_map[old_section_id] = section.id

        load_questions_for_section(section.id, section_dict.get('questions', []))
    pass

def load_questions_for_section(section_id, questions):
    for question_dict in questions:
        question = Question()
        question.question_txt = question_dict.get("question_txt", "")
        question.max_marks = question_dict.get("max_marks", 1)
        question.section_id = section_id
        question.sequence = question_dict.get("sequence", 1)
        question.question_type = question_dict.get("question_type", "")
        question.question_data = question_dict.get("question_data", "")

        question.save()
        old_question_id = question_dict['id']
        question_id_map[old_question_id] = question.id

def load_report_sections_for_auditstore(auditstore_id, report_sections):
    for report_section_dict in report_sections:
        old_section_id = report_section_dict['section_id']

        report_section = ReportSection()
        report_section.audit_store_id = auditstore_id
        report_section.section_id = section_id_map[old_section_id]
        report_section.pm_comment = report_section_dict.get("pm_comment", "")
        report_section.auditor_comment = report_section_dict.get("auditor_comment", "")
        report_section.auditor_comment_original = report_section_dict.get("auditor_comment_original", "")
        report_section.not_applicable = report_section_dict.get("not_application", "")

        report_section.save()

def load_answers_for_auditstore(auditstore_id, answers):
    for answer_dict in answers:
        old_question_id = answer_dict['question_id']

        answer = Answer()
        answer.answer_text = answer_dict.get("answer_text", "")
        answer.answer_text_original = answer_dict.get("answer_txt_original", "")
        answer.answer_comment = answer_dict.get("answer_comment", "")
        answer.marks_obtained = answer_dict.get("marks_obtained", "")
        answer.not_applicable = answer_dict.get("not_applicable", "")
        answer.question_id = question_id_map[old_question_id]
        answer.audit_store_id = auditstore_id

        answer.save()
