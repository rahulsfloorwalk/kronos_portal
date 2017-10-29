import xlsxwriter
import io
from PIL import Image


from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore
from answer.models import Answer, ReportSection
from questionnaire.models import Question
import audit_store.service_client as audit_store_client_service

# Import the byte stream handler.
from io import BytesIO
from urllib.request import urlopen

not_applicable_text = "N/A"

def generate_xlsx_from_structure(report_data):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory' : True})

    base_style = {
        'text_wrap':True,
        'top':1,
        'bottom':1,
        'left':1,
        'right':1,
        'bg_color': "#FFFFFF",
        'valign': 'vcenter',
        'bg_color': '#C6D9F0',
    }

    base_format = workbook.add_format(base_style)

    title_format = workbook.add_format({
        **base_style,
        'font_size':20,
        'bg_color': '#E5DFEC',
        'bold':True,
        'align': 'center',
    })

    summary_header_format = workbook.add_format({
        **base_style,
        'font_size':18,
        'bg_color': '#BFBFBF',
    })

    summary_value_format = workbook.add_format({
        **base_style,
        'font_size':18,
        'bg_color': '#BFBFBF',
        'bold': True,
    })

    header_format = workbook.add_format({
        **base_style,
        'font_size':18,
        'bg_color': '#C6D9F0',
        'bold':True,
    })

    points_format = workbook.add_format({
        **base_style,
        'font_size':15,
        'bg_color': '#FFFF00',
        'bold':True,
    })

    section_format = workbook.add_format({
        **base_style,
        'font_size':18,
        'bg_color': '#D99594',
        'bold':True,
        'align': 'center',
    })

    worksheet = workbook.add_worksheet("EARS")

    # assuming Calibri as the default font and 7px as widest single char width
    cell_char_width = 30

    cell_width = 171 #6.02cm to px with 72 dpi
    cell_height = 30

    start_row = 0
    start_col = 0
    worksheet.set_column(0, 0, 20)
    worksheet.set_column(1, 100, cell_char_width)
    worksheet.set_default_row(cell_height)
    row = start_row

    col = start_col
    worksheet.merge_range(row, col, row, col+4, report_data["client_name"], title_format)

    if report_data.get("logo_url"):
        image_data = BytesIO(urlopen(report_data["logo_url"]).read())
        img = Image.open(image_data)
        print("DPI", img.info.get('dpi'),img.info.get('jfif_density'))
        image_width, image_height = img.size

        if image_width > image_height:
            scale_factor = cell_width / image_width
        else:
            scale_factor = cell_height * 3 / image_height

        #x_scale = cell_height * 3 / image_height#
        #y_scale = cell_height * 3 / image_height

        worksheet.merge_range(row, col+5, row+2, col+5, "", title_format)
        worksheet.insert_image(row, col+5, report_data["logo_url"], {
            'image_data': image_data,
            'x_scale': scale_factor,
            'y_scale': scale_factor,
        })

    row += 1

    worksheet.merge_range(row, col, row, col+4, report_data["subtitle"], title_format)
    row += 1
    worksheet.merge_range(row, col, row, col+4, report_data["title"], title_format)
    row += 1

    col = start_col
    worksheet.write(row, col, "Audit Date", summary_header_format)
    col += 1
    worksheet.write(row, col, report_data["audit_date"], summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "Staff Names", summary_header_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    row += 1

    col = start_col
    worksheet.write(row, col, "Place", summary_header_format)
    col += 1
    worksheet.write(row, col, report_data["store_name"], summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "Bowling", summary_header_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    row += 1

    col = start_col
    worksheet.write(row, col, "Audit Time", summary_header_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "Tele Operator", summary_header_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    row += 1

    col = start_col
    worksheet.write(row, col, "Audit Score", summary_header_format)
    col += 1
    worksheet.write(row, col, report_data["marks_percentage"], summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "Restaurant", summary_header_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    worksheet.write(row, col, "", summary_value_format)
    col += 1
    row += 1

    col = start_col
    for cell in ["Points Lost", "Explore", "Analyze", "Respond", "Make it Stick", "Date Committed"]:
        worksheet.write(row, col, cell, header_format)
        col += 1
    row += 1

    for section in report_data["sections"]:
        col = start_col

        worksheet.write(row, col, section["points_lost"], points_format)
        col += 1

        worksheet.merge_range(row, col, row, col+4, section["name"], section_format)
        row += 1

        for q in section["questions"]:
            col = start_col

            worksheet.write(row, col, q["points_lost"], points_format)
            col += 1

            worksheet.write(row, col, q["question_text"], base_format)
            col += 1

            for cell in ["", "", "", ""]:
                worksheet.write(row, col, cell, base_format)
                col += 1
            row += 1

    workbook.close()
    output.seek(0)
    return output

def generate_ears_report_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    if not audit_store.is_presentable():
        raise AppLogicError("report is not presentable")

    audit_store = AuditStore.objects.prefetch_related(
        'answers',
        'report_sections',
        'report_sections__section',
        'report_sections__section__questions',
        'report_sections__section__questions__answers',
        #'audit__audit_cycle__sections',
        #'audit__audit_cycle__sections__questions',
        #'audit__audit_cycle__sections__questions__answers',
    ).filter(pk=audit_store_id).first()

    report_data = {
            "title": "Action Plan using E.A.R.S Model",
            "subtitle": "External Audit - " + audit_store.audit.audit_cycle.name,
            "client_name": audit_store.audit.audit_cycle.client.name,
            "audit_date": audit_store.audit_date.strftime('%d-%m-%Y'),
            "marks_percentage": str(audit_store.percentage()) + "%",
            "store_name": audit_store.audit.store.name,
            "store_address": audit_store.audit.store.address,
            "logo_url": audit_store.audit.audit_cycle.client.logo_url,
            "sections": []
            }

    for rs in audit_store.report_sections.all():
        if rs.not_applicable or rs.max_marks() is 0:
            continue

        report_section = {
                "name": rs.section.name,
                "max_marks": rs.max_marks(),
                "points_lost": rs.max_marks() - rs.marks_obtained(),
                "questions": [],
            }
        for q in rs.section.questions.all():
            for answer in audit_store.answers.all():
                if answer.audit_store_id == audit_store.id and answer.question_id == q.id:
                    a = answer

            if not a or a.not_applicable or q.max_marks in (a.marks_obtained, 0):
                continue

            marks_obtained = 0
            if a.marks_obtained is not None:
                marks_obtained = a.marks_obtained

            report_section["questions"].append({
                "question_text": q.question_txt,
                "answer_text": a.answer_text,
                "points_lost": q.max_marks - marks_obtained,
            })

        if len(report_section["questions"]) is not 0:
            report_data["sections"].append(report_section)

    file_name = report_data["store_name"] + " " + report_data["audit_date"] + ".xlsx"
    return generate_xlsx_from_structure(report_data), file_name

