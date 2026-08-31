import xlsxwriter
import io

from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.service.answer import find_answers_by_question_id,find_answers_by_question_id_for_client
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id
from questionnaire.models import Question

def get_questionnaire_survey_xlsx_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, client_user):
    audit_cycles = AuditCycle.objects.filter(
        id__in=audit_cycle_ids,
        questionnaire_type_id=questionnaire_type_id,
        status__in=AuditCycle.LIVE_REPORTING_STATUSES
    )

    cycle_map = {cycle.id: cycle for cycle in audit_cycles}
    audit_cycles = [cycle_map[cycle_id] for cycle_id in audit_cycle_ids if cycle_id in cycle_map]

    data = get_questionnaire_survey_by_audit_cycles(
        audit_cycle_ids,
        questionnaire_type_id,
        client_user
    )

    cycle_names = [cycle.name for cycle in audit_cycles]

    name = '{} Question Summary List.xlsx'.format( '_'.join(cycle_names) ).replace('/', '-')

    return write_data(data, cycle_names), name

def get_questionnaire_survey_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    sections = audit_cycle_obj.sections.order_by('sequence')
    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    questionnaire_survey_list = []
    for section in sections:
        if section.questions.filter(question_type__in=['MUTEX', 'MULTISELECT'],visibility=Question.VISIBLE_TO_ALL,hide_question=False).exists():
            row = {
                'type': 'section',
                'section_id': section.id,
                'section_name': section.name
            }
            questionnaire_survey_list.append(row)
            # for question in section.questions.filter(question_type__in=['MUTEX', 'MULTISELECT']).order_by('sequence'):
            for question in section.questions.filter(question_type__in=['MUTEX', 'MULTISELECT'],visibility=Question.VISIBLE_TO_ALL,hide_question=False).order_by('sequence'):
                if question.section == section:
                    if question.max_marks >= 0:
                        # answer_obj = find_answers_by_question_id(question.id)
                        answer_obj = find_answers_by_question_id_for_client(question.id)
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
                                    if question.question_type == 'MULTISELECT':
                                        option_answer_obj = answer_obj.filter(
                                            audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                            not_applicable=False, answer_text__contains=option['value'])
                                    else:
                                        option_answer_obj = answer_obj.filter(
                                            audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                            not_applicable=False, answer_text=option['value'])
                                else:
                                    if question.question_type == 'MULTISELECT':
                                        option_answer_obj = answer_obj.filter(
                                            audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                            audit_store__audit__store__id__in=non_admin_user_store_list,
                                            not_applicable=False, answer_text__contains=option['value'])
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

def get_questionnaire_survey_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, client_user):
    audit_cycles = list(AuditCycle.objects.filter(id__in=audit_cycle_ids, questionnaire_type_id=questionnaire_type_id, status__in=AuditCycle.LIVE_REPORTING_STATUSES))
    cycle_map = {cycle.id: cycle for cycle in audit_cycles}
    audit_cycles = [cycle_map[cycle_id] for cycle_id in audit_cycle_ids if cycle_id in cycle_map]
    client_admin = client_user.is_client_admin()
    non_admin_user_store_list = []
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    question_map = {}
    for audit_cycle in audit_cycles:
        sections = audit_cycle.sections.order_by('sequence')
        for section in sections:
            questions = section.questions.filter(question_type__in=['MUTEX', 'MULTISELECT'], visibility=Question.VISIBLE_TO_ALL, hide_question=False).order_by('sequence')
            for question in questions:
                if question.max_marks < 0:
                    continue
                answer_obj = find_answers_by_question_id_for_client(question.id).filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED], audit_store__audit__audit_cycle_id=audit_cycle.id, audit_store__audit__audit_cycle__status__in=AuditCycle.LIVE_REPORTING_STATUSES, not_applicable=False)
                if not client_admin:
                    answer_obj = answer_obj.filter(audit_store__audit__store__id__in=non_admin_user_store_list)
                total_answer_count = answer_obj.count()
                if total_answer_count == 0:
                    continue
                options_list = []
                for option in question.question_data.get('options', []):
                    if question.question_type == 'MULTISELECT':
                        option_count = answer_obj.filter(answer_text__contains=option['value']).count()
                    else:
                        option_count = answer_obj.filter(answer_text=option['value']).count()
                    percentage = round((float(option_count) / total_answer_count) * 100, 2)
                    options_list.append({'option_name': option['value'], 'percentage': percentage})
                section_key = section.name.strip().lower()
                question_key = question.question_txt.strip().lower()
                key = (section_key, question_key)
                if key not in question_map:
                    question_map[key] = {
                        'section_id': section.id,
                        'section_name': section.name,
                        'question_id': question.id,
                        'question_txt': question.question_txt,
                        'cycles': {}
                    }
                question_map[key]['cycles'][audit_cycle.id] = {
                    'audit_cycle_id': audit_cycle.id,
                    'audit_cycle_name': audit_cycle.name,
                    'options': options_list
                }
    section_map = {}
    if len(audit_cycles) == 1:
        cycle_id = audit_cycles[0].id
        for question_data in question_map.values():
            if cycle_id not in question_data['cycles']:
                continue
            section_name = question_data['section_name']
            if section_name not in section_map:
                section_map[section_name] = {
                    'section_name': section_name,
                    'questions': []
                }
            section_map[section_name]['questions'].append({
                'question_id': question_data['question_id'],
                'question_txt': question_data['question_txt'],
                'cycles': [question_data['cycles'][cycle_id]]
            })
    else:
        cycle_ids = [cycle.id for cycle in audit_cycles]
        for question_data in question_map.values():
            if not all(cycle_id in question_data['cycles'] for cycle_id in cycle_ids):
                continue
            section_name = question_data['section_name']
            if section_name not in section_map:
                section_map[section_name] = {
                    'section_name': section_name,
                    'questions': []
                }
            cycles = []
            for audit_cycle in audit_cycles:
                cycles.append(question_data['cycles'][audit_cycle.id])
            section_map[section_name]['questions'].append({
                'question_id': question_data['question_id'],
                'question_txt': question_data['question_txt'],
                'cycles': cycles
            })
    sections_data = list(section_map.values())
    return {
        'type': questionnaire_type_id,
        'questionnaire_type': questionnaire_type_id,
        'columns': [
            {
                'audit_cycle_id': audit_cycle.id,
                'audit_cycle_name': audit_cycle.name
            }
            for audit_cycle in audit_cycles
        ],
        'sections': sections_data
    }


def get_questionnaire_survey_xlsx_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id,status__in=AuditCycle.LIVE_REPORTING_STATUSES)
    questionnaire_survey_data = get_questionnaire_survey_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user)
    data = create_text_structure(audit_cycle_obj.name, questionnaire_survey_data)
    name = (str(audit_cycle_obj.name) + " Question Summary List.xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(audit_cycles, questionnaire_survey_data):
    rows = []
    rows.append({'type': 'title', 'content': ['Questionnaire Survey Summary']})
    cycle_names = [cycle.name for cycle in audit_cycles]
    for section_data in questionnaire_survey_data:
        rows.append({'type': 'section', 'name': section_data['section_name']})
        for question_data in section_data['questions']:
            cycle_options = {}
            for cycle in audit_cycles:
                cycle_data = question_data['cycles'].get(cycle.id)
                cycle_options[cycle.id] = cycle_data['options'] if cycle_data else []
            rows.append({'type': 'question', 'name': question_data['question_txt'], 'cycles': cycle_options})
    return rows


def write_data(data, cycle_names):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet('Questionnaire Survey')

    title_format = workbook.add_format({
        'bold': True,
        'font_size': 18,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'bg_color': '#D9EAF7',
        'text_wrap': True
    })

    section_format = workbook.add_format({
        'bold': True,
        'font_size': 13,
        'bg_color': '#BEBEBE',
        'border': 1,
        'valign': 'vcenter',
        'text_wrap': True
    })

    header_format = workbook.add_format({
        'bold': True,
        'font_size': 12,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'bg_color': '#BEBEBE',
        'text_wrap': True
    })

    question_format = workbook.add_format({
        'text_wrap': True,
        'font_size': 11,
        'border': 1,
        'valign': 'top'
    })

    answer_format = workbook.add_format({
        'text_wrap': True,
        'font_size': 11,
        'align': 'left',
        'valign': 'top',
        'border': 1
    })

    worksheet.set_column(0, 0, 65)
    worksheet.set_column(1, len(cycle_names), 40)
    worksheet.set_default_row(45)

    row = 0

    worksheet.merge_range(
        row,
        0,
        row,
        len(cycle_names),
        'Questionnaire Survey Summary',
        title_format
    )

    worksheet.set_row(row, 40)
    row += 2

    columns = data.get('columns', [])
    sections = data.get('sections', [])

    cycle_id_map = {}

    for column in columns:
        cycle_id_map[column.get('audit_cycle_name')] = column.get('audit_cycle_id')

    for section_data in sections:
        section_name = section_data.get('section_name', '')

        worksheet.write(
            row,
            0,
            section_name,
            section_format
        )

        for index, cycle_name in enumerate(cycle_names):
            worksheet.write(
                row,
                index + 1,
                cycle_name,
                header_format
            )

        worksheet.set_row(row, 45)
        row += 1

        for question_data in section_data.get('questions', []):
            question_text = question_data.get('question_txt', '')

            worksheet.write(
                row,
                0,
                question_text,
                question_format
            )

            cycles = question_data.get('cycles', [])

            cycle_map = {}

            for cycle in cycles:
                cycle_map[cycle.get('audit_cycle_id')] = cycle

            max_lines = 1

            for index, cycle_name in enumerate(cycle_names):
                cycle_id = cycle_id_map.get(cycle_name)
                cycle = cycle_map.get(cycle_id)

                if not cycle:
                    worksheet.write(
                        row,
                        index + 1,
                        '-',
                        answer_format
                    )
                    continue

                options = cycle.get('options', [])
                option_text = []

                for option in options:
                    option_name = option.get('option_name', '')
                    percentage = option.get('percentage', 0)

                    option_text.append(
                        '{} - {}%'.format(
                            option_name,
                            percentage
                        )
                    )

                answer = '\n'.join(option_text)

                worksheet.write(
                    row,
                    index + 1,
                    answer if answer else '-',
                    answer_format
                )

                if len(option_text) > max_lines:
                    max_lines = len(option_text)

            worksheet.set_row(
                row,
                max(70, max_lines * 25)
            )

            row += 1

        row += 1

    workbook.close()
    output.seek(0)
    return output