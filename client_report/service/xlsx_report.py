import xlsxwriter
import io
from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question

def get_xlsx_report(audit_store_id, client_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

    valid_client = audit_store.audit.store.client
    if (valid_client.id == int(client_id)):
        sections = audit_store.audit.audit_cycle.sections.all().order_by('sequence')
        answers = audit_store.answers.all()
        sorted_answers = sorted(
                sorted(answers, key=lambda answer:answer.question.sequence),
                key=lambda answer:answer.question.section.sequence
            )
        report_sections = audit_store.report_sections.all()
        sorted_report_sections = sorted(report_sections, key=lambda report_section:report_section.section.sequence)
        data = create_text_structure(sections, sorted_answers, sorted_report_sections)
        return write_data(data)
    else:
        raise AppLogicError("Invalid Client")

def create_text_structure(sections, answers, report_sections):
    section_key = 0
    answer_key = 0
    rows = []
    content = ["", "Question", "Auditor Response", "Marks", "Max Marks"]
    row = {'type': 'title', 'content': content}
    rows.append(row)
    for section in sections:
        content = [section.sequence, section.name, "", report_sections[section_key].marks_obtained(), section.max_marks()]
        row = {'type': 'header', 'content': content}
        rows.append(row)
        for key in range(answer_key, len(answers)):
            if (answers[key].question.section.sequence == section.sequence):
                content = ["", answers[key].question.question_txt, answers[key].answer_text,
                        answers[key].marks_obtained, answers[key].question.max_marks]
                row = {'type': 'line', 'content': content}
                rows.append(row)
            else:
                answer_key = key
                break
        content = ["Auditor Comment", report_sections[section_key].auditor_comment, "", "", ""]
        row = {'type': 'comment', 'content': content}
        rows.append(row)
        content = ["PM Comment", report_sections[section_key].pm_comment, "", "", ""]
        row = {'type': 'comment', 'content': content}
        rows.append(row)
        section_key += 1
    return rows

def write_data(data):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory' : True})
    worksheet = workbook.add_worksheet()
    header_format = workbook.add_format({'text_wrap':True, 'bold':True, 'font_size':20})
    line_format = workbook.add_format({'text_wrap':True, 'font_size':14})
    comment_format = workbook.add_format({'text_wrap':True, 'bold':True, 'font_size':14})
    worksheet.set_column(0, 0, 20)
    worksheet.set_column(1, 2, 60)
    worksheet.set_column(3, 4, 20)
    row = 0
    col = 0
    for line in data:
        if line.get('type') in ('header', 'title'):
            row += 2
            for point in line.get('content'):
                worksheet.write(row, col, point, header_format)
                col += 1
        elif line.get('type') == 'comment':
            row += 1
            for point in line.get('content'):
                worksheet.write(row, col, point, comment_format)
                col += 1
        else:
            for point in line.get('content'):
                worksheet.write(row, col, point, line_format)
                col += 1
        col = 0
        row += 1
    workbook.close()
    output.seek(0)
    return output
