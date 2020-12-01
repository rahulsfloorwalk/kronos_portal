import xlsxwriter
import io

from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.service.answer import find_answers_by_question_id
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id


def get_questionnaire_survey_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    sections = audit_cycle_obj.sections.order_by('sequence')
    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    questionnaire_survey_list = []
    for section in sections:
        if section.questions.filter(question_type='MUTEX').exists():
            row = {
                'type': 'section',
                'section_id': section.id,
                'section_name': section.name
            }
            questionnaire_survey_list.append(row)
            for question in section.questions.order_by('sequence'):
                if question.section == section:
                    if question.question_type == 'MUTEX' and question.max_marks > 0:
                        answer_obj = find_answers_by_question_id(question.id)
                        if client_admin:
                            answer_obj = answer_obj.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                                           not_applicable=False)
                        else:
                            answer_obj = answer_obj.filter(
                                audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                audit_store__audit__store__id__in=non_admin_user_store_list,
                                not_applicable=False)
                        total_answer_count = answer_obj.count()
                        if total_answer_count > 0:
                            options_list = []
                            for option in question.question_data['options']:
                                if client_admin:
                                    option_answer_obj = answer_obj.filter(
                                        audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                        not_applicable=False, answer_text=option['value'])
                                else:
                                    option_answer_obj = answer_obj.filter(
                                        audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                        audit_store__audit__store__id__in=non_admin_user_store_list,
                                        not_applicable=False, answer_text=option['value'])
                                option_count = option_answer_obj.count()
                                if option_count > 0:
                                    percentage = round((option_count / total_answer_count) * 100, 2)
                                    options_list.append({'option_name': option['value'], 'percentage': percentage})
                                else:
                                    options_list.append({'option_name': option['value'], 'percentage': 0})
                            row = {
                                'type': 'question',
                                'question_id': question.id,
                                'question_txt': question.question_txt,
                                'options_list': options_list
                            }
                            questionnaire_survey_list.append(row)
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
