import xlsxwriter
import io
from kronos.exceptions import ObjectNotFound, AppLogicError
from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question

def get_aggregate_report_for_manager(audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    client_id = audit_cycle.client.id
    return get_aggregate_report_for_client(audit_cycle_id, client_id)

def get_aggregate_report_for_client(audit_cycle_id, client_id):
    try:
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

    valid_client = audit_cycle.client
    if(valid_client.id == int(client_id)):
        audits = audit_cycle.audits.all()
        audit_stores = []
        for audit in audits:
            audit_store = audit.audit_stores.filter(status=AuditStore.COMPLETED).order_by('audit_date')
            audit_stores.extend(audit_store)

        audit_store_answer_list = []
        for audit_store in audit_stores:
            answers = audit_store.answers.all()
            sorted_answers = sorted(
                    sorted(answers, key=lambda answer:answer.question.sequence),
                    key=lambda answer:answer.question.section.sequence
                )
            audit_store_answer_list.append(sorted_answers)
        data = create_text_structure(audit_store_answer_list)
        name = (str(audit_cycle.name) + ".xlsx").replace("-", "")
        return write_data(data), name

    else:
        raise AppLogicError("Invalid Client")

def create_text_structure(audit_stores_answers_list):
    if audit_stores_answers_list is None or len(audit_stores_answers_list) == 0:
        raise ObjectNotFound
    rows = []
    audit = audit_stores_answers_list[0][0].audit_store.audit
    content = [audit.audit_cycle.name]
    row = {'type': 'title', 'content': content}
    rows.append(row)
    answers = audit_stores_answers_list[0]
    questions = []
    for answer in answers:
        questions.append(answer.question.question_txt)
    content = ["Store"] + questions
    row = {'type': 'question', 'content': content}
    rows.append(row)
    for answers in audit_stores_answers_list:
        store_name = answers[0].audit_store.audit.store.name + " - "+ answers[0].audit_store.audit.store.location.name
        ans_txt = []
        for answer in answers:
            ans_txt.append(answer.answer_text)
        content = [store_name] + ans_txt
        row = {'type': 'answer', 'content': content}
        rows.append(row)
    return rows

def write_data(data):
    even_color = '#FFFFFF'
    odd_color = '#D6D6D6'
    title_color = '#FFFFFF'
    question_color = '#BEBEBE'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory' : True})
    worksheet = workbook.add_worksheet()
    question_format = workbook.add_format({'text_wrap':True, 'bold':True, 'top':1, 'bottom':1, 'right':1, 'bg_color': question_color, 'font_color':'red'})
    title_format = workbook.add_format({'text_wrap':True, 'bold':True, 'font_size':16, 'bottom':1, 'bg_color': title_color, 'font_color':'red'})
    odd_line_format = workbook.add_format({'text_wrap':True, 'bottom':1, 'right':1, 'bg_color': odd_color})
    even_line_format = workbook.add_format({'text_wrap':True, 'bottom':1, 'right':1, 'bg_color': even_color})
    start_row = 0
    start_col = 0
    worksheet.set_column(0, 100, 30)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.write(row, col, point, title_format)
                col += 1
        elif line.get('type') == 'question':
            for point in line.get('content'):
                worksheet.write(row, col, point, question_format)
                col += 1
        else:
            for point in line.get('content'):
                if line_counter == 0:
                    worksheet.write(row, col, point, even_line_format)
                else:
                    worksheet.write(row, col, point, odd_line_format)
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
