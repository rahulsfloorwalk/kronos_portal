import xlsxwriter
import io
from audit_store import service_client as audit_store_service_client
from audit_store.models import AuditStore
not_applicable_text = "N/A"


def get_xlsx_report_for_manager(audit_store_id):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    sections = list(audit_store.audit.audit_cycle.sections.all().order_by('sequence'))
    answers = audit_store.answers.all()
    sorted_answers = sorted(
        sorted(answers, key=lambda answer:answer.question.sequence),
        key=lambda answer:answer.question.section.sequence
    )
    report_sections = audit_store.report_sections.all()
    sorted_report_sections = sorted(report_sections, key=lambda report_section:report_section.section.sequence)
    data, name = create_text_structure(sections, sorted_answers, sorted_report_sections, audit_store)
    return write_data(data), name


def get_xlsx_report_for_clientuser(audit_store_id, user):
    audit_store = audit_store_service_client.find_by_id_for_clientuser(audit_store_id, user)
    sections = list(audit_store.audit.audit_cycle.sections.all().order_by('sequence'))
    answers = audit_store.answers.all()
    sorted_answers = sorted(
        sorted(answers, key=lambda answer:answer.question.sequence),
        key=lambda answer:answer.question.section.sequence
    )
    report_sections = audit_store.report_sections.all()
    sorted_report_sections = sorted(report_sections, key=lambda report_section:report_section.section.sequence)
    data, name = create_text_structure(sections, sorted_answers, sorted_report_sections, audit_store)
    return write_data(data), name

def create_text_structure(sections, answers, report_sections, audit_store):
    details_section = get_details_section(audit_store, report_sections, sections)
    summary_section = get_summary_section(audit_store, sections, report_sections)
    answers_section = get_answers_section(sections, answers, report_sections)

    audit_date = audit_store.audit_date
    store_name = audit_store.audit.store.name
    name = (store_name + " " + str(audit_date) + ".xlsx")
    data = [details_section, summary_section, answers_section]
    return data, name

def get_details_section(audit_store, report_sections, sections):
    audit_date = audit_store.audit_date.strftime('%d-%m-%Y')
    percentage = audit_store.percentage()
    store = audit_store.audit.store
    store_address = audit_store.audit.store.address
    store_city_name = audit_store.audit.store.city.name
    audit_cycle_type = audit_store.audit.audit_cycle.type
    rows = []
    content = ["", "Audit Report"]
    row = {'type': 'title', 'content': content}
    rows.append(row)
    content = ["Store Code", store.code]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Store Name", store.name]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Store Type", store.type]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Store Priority", store.priority]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Audit Type", audit_cycle_type]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Address", "{}, {}".format(store_address, store_city_name)]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Audit Date", str(audit_date)]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    content = ["Total Score", str(round(percentage)) + "%"]
    row = {'type': 'line', 'content': content}
    rows.append(row)
    return rows

def get_summary_section(audit_store, sections, report_sections):
    section_key = 0
    rows = []
    content = ["Audit Summary", "", ""]
    row = {'type': 'title', 'content': content}
    rows.append(row)
    content = ["Section Name", "Marks Obtained", "Max Marks"]
    row = {'type': 'header', 'content': content}
    rows.append(row)
    for section in sections:
        if report_sections[section_key].not_applicable:
            content = [section.name, not_applicable_text, not_applicable_text]
        else:
            content = [section.name, report_sections[section_key].marks_obtained(), report_sections[section_key].max_marks()]
        row = {'type': 'line', 'content': content}
        rows.append(row)
        section_key += 1
    return rows

def get_answers_section(sections, answers, report_sections):
    answer_key = 0
    section_key = 0
    rows = []
    content = ["", "Question", "Auditor Response", "Marks", "Max Marks"]
    row = {'type': 'title', 'content': content}
    rows.append(row)
    for section in sections:
        if report_sections[section_key].not_applicable:
            content = [section.sequence, section.name, not_applicable_text, not_applicable_text, not_applicable_text]
            row = {'type': 'header', 'content': content}
            rows.append(row)
            row = {'type': 'line', 'content': ["", "", "", "", ""]}
            rows.append(row)
            section_key += 1
            continue
        content = [section.sequence, section.name, "", report_sections[section_key].marks_obtained(), report_sections[section_key].max_marks()]
        row = {'type': 'header', 'content': content}
        rows.append(row)
        for key in range(answer_key, len(answers)):
            answer = answers[key]
            if (answer.question.section.sequence == section.sequence):
                if (answer.not_applicable):
                    content = ["", answers[key].question.question_txt, not_applicable_text, not_applicable_text, not_applicable_text]
                else:
                    answer_text = answers[key].answer_text
                    if answers[key].question.question_type == "MULTISELECT":
                        answer_text = (answers[key].answer_text).replace(";", ", ")
                    content = ["", answers[key].question.question_txt, answer_text,
                               answers[key].marks_obtained, answers[key].question.max_marks]
                row = {'type': 'line', 'content': content}
                rows.append(row)
            else:
                answer_key = key
                break
        content = ["", "Section Summary", report_sections[section_key].auditor_comment, "", ""]
        row = {'type': 'comment', 'content': content}
        rows.append(row)
        # content = ["", "PM Comment", report_sections[section_key].pm_comment, "", ""]
        # row = {'type': 'pm_comment', 'content': content}
        # rows.append(row)
        section_key += 1
    return rows

def write_data(sections):
    odd_color = '#DFF0D8'
    even_color = '#FFFFFF'
    title_color = '#FCF8E3'
    header_color = '#BEBEBE'
    auditor_comment_color = '#E3B9B8'
    pm_comment_color = '#FFFFBF'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    title_format = workbook.add_format({
        'text_wrap':True,
        'bold':True,
        'font_size':20,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'bg_color': title_color,
        'valign': 'vcenter',
    })
    header_format = workbook.add_format({
        'text_wrap':True,
        'bold':True,
        'font_size':16,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'bg_color': header_color,
        'valign': 'vcenter',
    })
    odd_line_format = workbook.add_format({
        'text_wrap':True,
        'bg_color': odd_color,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'valign': 'vcenter',
    })
    even_line_format = workbook.add_format({
        'text_wrap':True,
        'bg_color': even_color,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'valign': 'vcenter',
    })
    auditor_comment_format = workbook.add_format({
        'text_wrap':True,
        'bg_color': auditor_comment_color,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'valign': 'vcenter',
    })
    pm_comment_format = workbook.add_format({
        'text_wrap': True,
        'bg_color': pm_comment_color,
        'top': 1,
        'bottom': 1,
        'left': 1,
        'right': 1,
        'valign': 'vcenter',
    })
    start_row = 0
    start_col = 0
    worksheet.set_column(start_col, start_col, 15)
    worksheet.set_column(start_col + 1, start_col + 2, 60)
    worksheet.set_column(start_col + 3, start_col + 4, 20)
    worksheet.set_default_row(20)
    row = start_row
    col = start_col

    sec_num = 0
    line_counter = 0
    for section in sections:
        for line in section:
            col = start_col
            if line.get('type') == 'title':
                row += 1
                for point in line.get('content'):
                    worksheet.write(row, col, point, title_format)
                    col += 1
            elif line.get('type') == 'header':
                for point in line.get('content'):
                    worksheet.write(row, col, point, header_format)
                    col += 1
            elif line.get('type') == 'comment':
                row += 1
                for point in line.get('content'):
                    worksheet.write(row, col, point, auditor_comment_format)
                    col += 1
            elif line.get('type') == 'pm_comment':
                for point in line.get('content'):
                    worksheet.write(row, col, point, pm_comment_format)
                    col += 1
            else:
                for point in line.get('content'):
                    if line_counter == 0:
                        worksheet.write(row, col, point, even_line_format)
                    else:
                        worksheet.write(row, col, point, odd_line_format)
                    col += 1
            line_counter = ~line_counter
            row += 1
            col = start_col
        sec_num += 1
        if(sec_num == 1):
            start_col += 2
            row = start_row
        elif(sec_num == 2):
            start_col -= 2
            if(row < 10):
                row = 10
    workbook.close()
    output.seek(0)
    return output
