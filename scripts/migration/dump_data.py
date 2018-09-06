import os
import json
from client.models import Client, Store
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question, Section
from pprint import pprint

def get_data_dump_for_client(client_id):
    data = {}
    client = Client.objects.get(pk=client_id)
    client_dict = {}

    client_dict['id'] = client.id
    client_dict['name'] = client.name
    client_dict['brand_name'] = client.brand_name
    client_dict['email'] = client.email
    client_dict['phone'] = client.phone
    client_dict['logo_url'] = client.logo_url
    client_dict['brand_logo_url'] = client.brand_logo_url
    client_dict['stores'] = get_stores_for_client_id(client.id)
    client_dict['audit_cycles'] = get_audit_cycles_for_client_id(client.id)

    data['client'] = client_dict
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/dump.json', "w") as outfile:
        # with open('./data/dump.json', 'w') as outfile:
        outfile.write(json.dumps(data, indent=4))
    pprint(data)
    return data

def get_stores_for_client_id(client_id):
    data = []
    print(client_id)
    stores = Store.objects.filter(client_id=client_id)
    for store in stores:
        store_dict = {}

        store_dict['id'] = store.id
        store_dict['code'] = store.code
        store_dict['type'] = store.type
        store_dict['priority'] = store.priority
        store_dict['name'] = store.name
        store_dict['address'] = store.address
        # store_dict['location'] = store.location.id
        store_dict['city_id'] = store.city.id
        store_dict['client_id'] = store.client.id
        store_dict['phone'] = store.phone
        store_dict['extra_data'] = store.extra_data

        data.append(store_dict)
    return data

def get_audit_cycles_for_client_id(client_id):
    data = []
    audit_cycles = AuditCycle.objects.filter(client_id=client_id)
    for audit_cycle in audit_cycles:
        audit_cycle_dict = {}

        audit_cycle_dict['id'] = audit_cycle.id
        audit_cycle_dict['name'] = audit_cycle.name
        audit_cycle_dict['type'] = audit_cycle.type
        audit_cycle_dict['status'] = audit_cycle.status
        audit_cycle_dict['start_date'] = audit_cycle.start_date.strftime('%m/%d/%Y')
        audit_cycle_dict['end_date'] = audit_cycle.end_date.strftime('%m/%d/%Y')
        audit_cycle_dict['earnings_per_audit'] = audit_cycle.earnings_per_audit
        audit_cycle_dict['revenue_per_audit'] = audit_cycle.revenue_per_audit
        audit_cycle_dict['reimbursement'] = audit_cycle.reimbursement
        audit_cycle_dict['description'] = audit_cycle.description
        audit_cycle_dict['client_id'] = audit_cycle.client.id
        audit_cycle_dict['post_approval_description'] = audit_cycle.post_approval_description

        audit_cycle_dict['audits'] = get_audits_for_audit_cycle(audit_cycle.id)
        audit_cycle_dict['sections'] = get_sections_for_audit_cycle(audit_cycle.id)

        data.append(audit_cycle_dict)
    return data

def get_audits_for_audit_cycle(audit_cycle_id):
    data = []
    audits = Audit.objects.filter(audit_cycle_id=audit_cycle_id)
    for audit in audits:
        audit_dict = {}

        audit_dict['id'] = audit.id
        audit_dict['count'] = audit.count
        audit_dict['earnings_per_audit'] = audit.earnings_per_audit
        audit_dict['reimbursement'] = audit.reimbursement
        audit_dict['store_id'] = audit.store.id
        audit_dict['audit_cycle_id'] = audit.audit_cycle.id
        audit_dict['post_approval_description'] = audit.post_approval_description
        audit_dict['hidden'] = audit.hidden
        audit_dict['audit_stores'] = get_auditstores_for_audit(audit.id)

        data.append(audit_dict)
    return data

def get_auditstores_for_audit(audit_id):
    data = []
    auditstores = AuditStore.objects.filter(audit_id=audit_id)
    for auditstore in auditstores:
        auditstore_dict = {}

        auditstore_dict['id'] = auditstore.id
        auditstore_dict['status'] = auditstore.status
        auditstore_dict['audit_date'] = auditstore.audit_date.strftime('%m/%d/%Y')
        auditstore_dict['qa_rating'] = auditstore.qa_rating
        auditstore_dict['audit_id'] = auditstore.audit.id
        auditstore_dict['user_id'] = 1641
        auditstore_dict['report_sections'] = get_report_sections_for_auditstore(auditstore.id)
        auditstore_dict['answers'] = get_answers_for_auditstore(auditstore.id)

        data.append(auditstore_dict)
    return data

def get_sections_for_audit_cycle(audit_cycle_id):
    data = []
    sections = Section.objects.filter(audit_cycle_id=audit_cycle_id)
    for section in sections:
        section_dict = {}

        section_dict['id'] = section.id
        section_dict['audit_cycle_id'] = section.audit_cycle.id
        section_dict['name'] = section.name
        section_dict['sequence'] = section.sequence
        section_dict['questions'] = get_questions_for_section(section.id)

        data.append(section_dict)
    return data

def get_questions_for_section(section_id):
    data = []
    questions = Question.objects.filter(section_id=section_id)
    for question in questions:

        question_dict = {}
        question_dict['id'] = question.id
        question_dict['question_txt'] = question.question_txt
        question_dict['max_marks'] = question.max_marks
        question_dict['section_id'] = question.section.id
        question_dict['sequence'] = question.sequence
        question_dict['question_type'] = question.question_type
        question_dict['question_data'] = question.question_data

        data.append(question_dict)
    return data

def get_report_sections_for_auditstore(audit_store_id):
    data = []
    report_sections = ReportSection.objects.filter(audit_store_id=audit_store_id)
    for report_section in report_sections:
        report_section_dict = {}

        report_section_dict['id'] = report_section.id
        report_section_dict['audit_store_id'] = report_section.audit_store.id
        report_section_dict['section_id'] = report_section.section_id
        report_section_dict['pm_comment'] = report_section.pm_comment
        report_section_dict['auditor_comment'] = report_section.auditor_comment
        report_section_dict['auditor_comment_original'] = report_section.auditor_comment_original
        report_section_dict['not_application'] = report_section.not_applicable

        data.append(report_section_dict)
    return data

def get_answers_for_auditstore(auditstore_id):
    data = []
    answers = Answer.objects.filter(audit_store_id=auditstore_id)
    for answer in answers:
        answer_dict = {}

        answer_dict['id'] = answer.id
        answer_dict['answer_text'] = answer.answer_text
        answer_dict['answer_txt_original'] = answer.answer_text_original
        answer_dict['answer_comment'] = answer.answer_comment
        answer_dict['marks_obtained'] = answer.marks_obtained
        answer_dict['not_applicable'] = answer.not_applicable
        answer_dict['question_id'] = answer.question.id
        answer_dict['audit_store_id'] = answer.audit_store.id

        data.append(answer_dict)
    return data


