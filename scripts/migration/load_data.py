import os, json, datetime
from client.models import Client, ClientUser, Store
from manager.models import Location, City
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question, Section
from pprint import pprint

def load_data_dump_for_client(client_id):
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/dump.json', "r") as json_data:
        data = json.loads(json_data)
        stores_dict = data.get('stores', [])
        audit_cycles_list = data.get('audit_cycles', [])
        load_audit_cycles(client_id, audit_cycles_list)
        load_stores(client_id, stores_dict)

def load_stores(client_id, stores):
    for store_dict in stores:
        store = Store()
        store.client_id = client_id
        store.location_id = store_dict.get("location", None)
        store.phone = store_dict.get("phone", "")
        store.code = store_dict.get("code", "")
        store.city_id = store_dict.get("city", None)
        store.priority = store_dict.get("priority", "")
        store.extra_data = store_dict.get("extra_data", "")
        store.address = store_dict.get("address", "")
        store.type = store_dict.get("type", "")
        store.name = store_dict.get("name", "")

def load_audit_cycles(client_id, audit_cycles):
    for audit_cycle_dict in audit_cycles:
        audit_cycle = AuditCycle()
        start_date = datetime.datetime.strptime(audit_cycle_dict.get('start_date', ""), "%m/%d/%Y")
        end_date = datetime.datetime.strptime(audit_cycle_dict.get('end_date', ""), "%m/%d/%Y")
        audit_cycle.client_id = client_id
        audit_cycle.start_date = start_date
        audit_cycle.end_date = end_date
        audit_cycle.description = audit_cycle_dict.get('description', "")
        audit_cycle.earnings_per_audit = audit_cycle_dict.get('earnings_per_audit', "")
        audit_cycle.reimbursement = audit_cycle_dict.get('reimbursement', "")
        audit_cycle.name = audit_cycle_dict.get('name', "")
        audit_cycle.post_approval_description = audit_cycle_dict.get('post_approval_description', "")
        audit_cycle.status = audit_cycle_dict.get('status', "")
        audit_cycle.type = audit_cycle_dict.get('type', "")
        audit_cycle.revenue_per_audit = audit_cycle_dict.get('revenue_per_audit', "")
        audit_cycle.save()
        load_sections_for_audit_cycle(audit_cycle.id, audit_cycle_dict.get('sections', []))
        load_audits_for_audit_cycle(audit_cycle.id, audit_cycle_dict.get('audits', []))

def load_sections_for_audit_cycle(audit_cycle_id, sections):
    for section_dict in sections:
        section = Section()
        section.name = section_dict.get("name", "")
        section.sequence = section_dict.get("sequence", 1)
        section.save()
        load_questions_for_section(section.id, section_dict.get('questions', []))
    pass

def load_questions_for_section(section_id, questions):
    for question_dict in questions:
        question = Question()
        question.question_txt = question_dict.get("text", "")
        question.sequence = question_dict.get("sequence", 1)
        question.section_id = section_id
        question.save()

def load_audits_for_audit_cycle(audit_cycle_id, audits):
    for audit_dict in audits:
        audit = Audit()
        audit.post_approval_description = audit_dict.get("post_approval_description", "")
        audit.earnings_per_audit = audit_dict.get("earnings_per_audit", "")
        audit.count = audit_dict.get("count", "")
        audit.reimbursement = audit_dict.get("reimbursement", "")
        audit.reports = audit_dict.get("reports", "")
        audit.audit_cycle_id = audit_cycle_id
        audit.save()
        load_reports_for_audits(audit.id, audit_dict.get("reports", []))


def load_reports_for_audits(audit_id, reports):
    for report_dict in reports:
        auditstore = AuditStore()
        audit_date = datetime.datetime.strptime(report_dict.get('audit_date', ""), "%m/%d/%Y")
        auditstore.status = report_dict.get("status", "")
        auditstore.audit_date = audit_date
        auditstore.user_id = report_dict.get("user_id", 1641)
        auditstore.audit_id = audit_id
        auditstore.save()
        load_report_sections_for_auditstore(auditstore.id, report_dict.get("report_sections", []))
        load_answers_for_auditstore(auditstore.id, report_dict.get("answers", []))

def load_report_sections_for_auditstore(auditstore_id, report_sections):
    for report_section_dict in report_sections:
        report_section = ReportSection()
        report_section.pm_comment = report_section_dict.get("pm_comment", "")
        report_section.auditor_comment = report_section_dict.get("auditor_comment", "")
        report_section.section_id = None #TODO - get section id here
        report_section.not_applicable = report_section_dict.get("not_application", "")
        report_section.auditor_comment_original = report_section_dict.get("pm_comment", "")
        report_section.audit_store_id = auditstore_id
        report_section.save()

def load_answers_for_auditstore(auditstore_id, answers):
    for answer_dict in answers:
        answer = Answer()
        answer.not_applicable = answer_dict.get("not_applicable", "")
        answer.marks_obtained = answer_dict.get("marks_obtained", "")
        answer.answer_text_original = answer_dict.get("answer_txt_original", "")
        answer.answer_text = answer_dict.get("answer_txt", "")
        answer.answer_comment = answer_dict.get("answer_comment", "")
        answer.question.id = None #TODO - get question id here
        answer.audit_store.id = auditstore_id
        answer.save()
