import xlsxwriter
import io

from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.service.answer import find_answers_by_question_id,find_answers_by_question_id_for_client
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id
from questionnaire.models import Question


def get_questionnaire_survey_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, client_user):
    audit_cycles = AuditCycle.objects.filter(id__in=audit_cycle_ids, questionnaire_type_id=questionnaire_type_id).prefetch_related('sections')
    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    questionnaire_survey_list = []
    for audit_cycle_obj in audit_cycles:
        cycle_data = {'audit_cycle_id': audit_cycle_obj.id, 'sections': []}
        sections = audit_cycle_obj.sections.order_by('sequence')
        for section in sections:
            questions = section.questions.filter(question_type__in=['MUTEX', 'MULTISELECT'], visibility=Question.VISIBLE_TO_ALL, hide_question=False).order_by('sequence')
            if not questions.exists():
                continue
            section_data = {'section_id': section.id, 'section_name': section.name, 'questions': []}
            for question in questions:
                if question.max_marks < 0:
                    continue
                answer_obj = find_answers_by_question_id_for_client(question.id).filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED], not_applicable=False, audit_store__audit__audit_cycle_id=audit_cycle_obj.id)
                if not client_admin:
                    answer_obj = answer_obj.filter(audit_store__audit__store__id__in=non_admin_user_store_list)
                total_answer_count = answer_obj.count()
                if total_answer_count == 0:
                    continue
                options_list = []
                for option in question.question_data['options']:
                    if question.question_type == 'MULTISELECT':
                        option_count = answer_obj.filter(answer_text__contains=option['value']).count()
                    else:
                        option_count = answer_obj.filter(answer_text=option['value']).count()
                    percentage = round((float(option_count) / total_answer_count) * 100, 2)
                    options_list.append({'option_name': option['value'], 'percentage': percentage})
                section_data['questions'].append({'question_id': question.id, 'question_txt': question.question_txt, 'options_list': options_list})
            if section_data['questions']:
                cycle_data['sections'].append(section_data)
        questionnaire_survey_list.append(cycle_data)
    return questionnaire_survey_list


def get_questionnaire_survey_xlsx_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    questionnaire_survey_data = get_questionnaire_survey_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user)
    data = create_text_structure(audit_cycle_obj.name, questionnaire_survey_data)
    name = (str(audit_cycle_obj.name) + " Question Summary List" + ".xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(audit_cycle_name, questionnaire_survey_data):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [audit_cycle_name + ' Question Summary']}
    rows.append(row)


    # generate improvable question rows
    for survey_data in questionnaire_survey_data:
        if survey_data['type'] == "section":
            row = {
                'type': survey_data['type'],
                'name': survey_data['section_name']
            }
        else:
            row = {
                'type': survey_data['type'],
                'name': survey_data['question_txt'],
                'options': survey_data['options_list']
            }
        rows.append(row)
    return rows


def write_data(data):
    title_color = '#FFFFFF'
    question_color = '#BEBEBE'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    section_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': question_color,
        'font_color': 'black',
        'valign': 'vcenter',
        'font_size': 14,
    })

    title_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'font_size': 16,
        'bottom': 1,
        'bg_color': title_color,
        'font_color': 'black',
        'valign': 'vcenter',
    })

    base_answer_style = workbook.add_format({
        'text_wrap': True,
        'bottom': 1,
        'right': 1,
        'valign': 'vcenter',
    })

    start_row = 0
    start_col = 0
    # worksheet.set_column(0, 512, 15)
    worksheet.set_column(0, 0, 60)
    worksheet.set_column(1, 1, 30)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.merge_range(row, col, row, col + 1, point, title_format)
                col += 1
        elif line.get('type') == 'section':
            worksheet.merge_range(row, col, row, col + 1, line.get('name', ""), section_format)
            col += 1
        elif line.get('type') == 'question':
            worksheet.write(row, col, line.get('name'), base_answer_style)
            col += 1
            option_text_data = ""
            for option in line.get('options'):
                option_text_data = option_text_data + str(option['option_name']) + "-" + str(option['percentage']) + "%" + "\n"
            worksheet.write(row, col, option_text_data, base_answer_style)
            col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
