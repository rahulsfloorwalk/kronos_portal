import xlsxwriter
import io

from django.db.models import Sum
from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.models import Question
from questionnaire.service.question import find_by_audit_cycle
from answer.service.answer import find_answers_by_question_id,find_answers_by_question_id_for_client
from kronos.utils import get_color_code, get_color_hex_from_code
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id


def get_improvable_questions_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    improvable_questions_list = []
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    questions_list = find_by_audit_cycle(audit_cycle_obj.id).filter(visibility=Question.VISIBLE_TO_ALL,hide_question=False
        ).prefetch_related('section')\
        .values('id', 'max_marks', 'section__id', 'section__name', 'question_txt')

    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    for question in questions_list:
        section_id = question['section__id']
        if question['max_marks'] > 0:
            answer_obj = find_answers_by_question_id_for_client(question['id'])
            if client_admin:
                answer_obj = answer_obj.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                               not_applicable=False,
                                               audit_store__report_sections__section_id=section_id,
                                               audit_store__report_sections__not_applicable=False,
                                               question__visibility=Question.VISIBLE_TO_ALL,
                                               question__hide_question=False)
            else:
                answer_obj = answer_obj.filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                               audit_store__audit__store__id__in=non_admin_user_store_list,
                                               not_applicable=False,
                                               audit_store__report_sections__section_id=section_id,
                                               audit_store__report_sections__not_applicable=False,question__visibility=Question.VISIBLE_TO_ALL,
                                               question__hide_question=False)
            if answer_obj.count() > 0:
                total_question_marks = question['max_marks'] * answer_obj.count()
                # obtained_marks = (answer_obj.aggregate(sum_marks=Sum('marks_obtained')))['sum_marks']
                obtained_marks = answer_obj.aggregate(sum_marks=Sum('marks_obtained'))['sum_marks'] or 0
                percentage = round((obtained_marks / total_question_marks) * 100, 2)
                if percentage < 75:
                    # if percentage < 75:
                    improvable_questions_dict = {}
                    improvable_questions_dict['question_id'] = question['id']
                    improvable_questions_dict['question_txt'] = question['question_txt']
                    improvable_questions_dict['question_section'] = question['section__name']
                    improvable_questions_dict['total_marks'] = total_question_marks
                    improvable_questions_dict['obtained_marks'] = obtained_marks
                    improvable_questions_dict['lost_marks'] = total_question_marks - obtained_marks
                    improvable_questions_dict['percentage'] = percentage
                    improvable_questions_list.append(improvable_questions_dict)

    return sorted(improvable_questions_list, key=lambda qd: qd['lost_marks'], reverse=True)

from django.db.models import Sum, Count
def get_improvable_questions_by_audit_cycles(audit_cycle_ids,questionnaire_type_id,client_user):

    audit_cycle_ids = list(set(audit_cycle_ids))
    valid_audit_cycle_ids = list( AuditCycle.objects.filter(id__in=audit_cycle_ids,questionnaire_type_id=questionnaire_type_id).values_list('id', flat=True))

    if not valid_audit_cycle_ids:
        return []

    questions_list = (
        Question.objects.filter(section__audit_cycle_id__in=valid_audit_cycle_ids,visibility=Question.VISIBLE_TO_ALL,hide_question=False,max_marks__gt=0)
        .values('id','max_marks','section__id','section__name','question_txt')
        .order_by('section__sequence', 'id')
        .distinct()
    )
    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = (
            find_non_client_admin_user_store_by_client_user_id(client_user.id))

        non_admin_user_store_list = (non_admin_user_store.get_store_list())

    improvable_questions_list = []

    for question in questions_list:
        section_id = question['section__id']
        answer_filters = {
            'question_id': question['id'],
            'audit_store__status__in': [AuditStore.COMPLETED,AuditStore.ACCEPTED],
            'not_applicable': False,
            'audit_store__report_sections__section_id': section_id,
            'audit_store__report_sections__not_applicable': False,
            'question__visibility': Question.VISIBLE_TO_ALL,
            'question__hide_question': False,
            'audit_store__audit__audit_cycle_id__in': ( valid_audit_cycle_ids),
        }

        if not client_admin:
            answer_filters['audit_store__audit__store_id__in'] = non_admin_user_store_list

        answer_data = (
            find_answers_by_question_id_for_client(question['id'])
            .filter(**answer_filters)
            .aggregate(answer_count=Count('id'),obtained_marks=Sum('marks_obtained')))

        answer_count = answer_data['answer_count'] or 0
        obtained_marks = answer_data['obtained_marks'] or 0
        if answer_count == 0:
            continue

        total_question_marks = (question['max_marks'] * answer_count)
        if total_question_marks <= 0:
            continue

        percentage = round((float(obtained_marks) / total_question_marks) * 100,2)
        if percentage < 75:
            improvable_questions_list.append({
                'question_id': question['id'],
                'question_txt': question['question_txt'],
                'question_section': question['section__name'],
                'total_marks': total_question_marks,
                'obtained_marks': obtained_marks,
                'lost_marks': ( total_question_marks - obtained_marks),
                'percentage': percentage,
            })

    return sorted(improvable_questions_list,key=lambda qd: qd['lost_marks'],reverse=True)

def get_improvable_questions_list(question_id,user):
    # question = Question.objects.get(id=question_id)
    question = Question.objects.get(id=question_id,visibility=Question.VISIBLE_TO_ALL,hide_question=False)
    # answer_obj = find_answers_by_question_id(question_id).filter(audit_store__status__in=[AuditStore.COMPLETED,AuditStore.ACCEPTED],
    #     not_applicable=False)

    answer_obj = find_answers_by_question_id(question_id).filter(
        audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
        not_applicable=False,
        question__visibility=Question.VISIBLE_TO_ALL,
        question__hide_question=False
    )

    total_marks = question.max_marks * answer_obj.count()
    obtained_marks = answer_obj.aggregate(sum_marks=Sum('marks_obtained'))['sum_marks'] or 0

    percentage = 0
    if total_marks > 0:
        percentage = round((obtained_marks / total_marks) * 100,2)

    reports = {}
    for ans in answer_obj.select_related('audit_store','audit_store__audit','audit_store__audit__store'):
        lost_marks = (question.max_marks - ans.marks_obtained)
        if lost_marks > 0:
            audit_store_id = ans.audit_store.id
            reports[audit_store_id] = {
                "audit_store_id": audit_store_id,
                "store_id": ans.audit_store.audit.store.id,
                "store_name": ans.audit_store.audit.store.name,
                "marks_obtained": ans.marks_obtained,
                "max_marks": question.max_marks,
                "lost_marks": lost_marks,
                "status": ans.audit_store.status
            }
    return {
        "question_id": question.id,
        "question_txt": question.question_txt,
        "question_section": question.section.name,
        "total_marks": total_marks,
        "obtained_marks": obtained_marks,
        "lost_marks": total_marks - obtained_marks,
        "percentage": percentage,
        "reports": reports
    }


def get_improvable_questions_xlsx_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user):
    audit_cycle_obj = AuditCycle.objects.get(id=audit_cycle_id, questionnaire_type_id=questionnaire_type_id)
    improvable_questions_data = get_improvable_questions_by_audit_cycle(audit_cycle_id, questionnaire_type_id, client_user)
    data = create_text_structure(audit_cycle_obj.name, improvable_questions_data)
    name = (str(audit_cycle_obj.name) + " Improvable Questions List" + ".xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(audit_cycle_name, improvable_questions_data):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [audit_cycle_name + ' Improvable Questions']}
    rows.append(row)

    # generate header of improvable questions
    cells = [{'value': "Section"}, {'value': "Question"}, {'value': "Obtained Marks / Total Marks"},
             {'value': "Marks Lost"}]
    row = {'type': 'header', 'content': cells}
    rows.append(row)

    # generate improvable question rows
    for question in improvable_questions_data:
        question_section = {
            'value': question['question_section'],
            'color_code': get_color_code(0, 0)
        }
        question_txt = {
            'value': question['question_txt'],
            'color_code': get_color_code(0, 0)
        }
        marks = {
            'value': str(question['obtained_marks']) + " / " + str(question['total_marks']),
            'color_code': get_color_code(0, 0)
        }
        marks_lost = {
            'value': question['lost_marks'],
            'color_code': get_color_code(question['percentage'], 100)
        }
        content = [question_section, question_txt, marks, marks_lost]
        row = {
            'type': 'question_data',
            'content': content
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

    base_answer_style = {
        'text_wrap': True,
        'bottom': 1,
        'right': 1,
        'valign': 'vcenter',
    }


    def get_format_for_color_code(wb, base_style_dict, color_code):
        colored_style = base_style_dict.copy()
        colored_style['bg_color'] = get_color_hex_from_code(color_code)
        return wb.add_format(colored_style)

    start_row = 0
    start_col = 0
    # worksheet.set_column(0, 512, 15)
    worksheet.set_column(0, 0, 30)
    worksheet.set_column(1, 1, 50)
    worksheet.set_column(2, 2, 20)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.merge_range(row, col, row, col + 3, point, title_format)
                col += 1
        elif line.get('type') == 'header':
            for cell in line.get('content'):
                if isinstance(cell, dict):
                    if cell.get('colspan', 1) > 1:
                        worksheet.merge_range(row, col, row, col + cell.get('colspan') - 1, cell.get('value'),
                                              section_format)
                        col += cell.get('colspan', 1)
                    else:
                        worksheet.write(row, col, cell.get('value', ""), section_format)
                        col += 1
                else:
                    worksheet.write(row, col, cell, section_format)
                    col += 1
        elif line.get('type') == 'question_data':
            for cell in line.get('content'):
                worksheet.write(row, col, cell.get('value'),
                                get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output
