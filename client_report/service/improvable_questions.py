import xlsxwriter
import io

from django.db.models import Sum,Count
from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.models import Question
from questionnaire.service.question import find_by_audit_cycle
from answer.service.answer import find_answers_by_question_id,find_answers_by_question_id_for_client
from kronos.utils import get_color_code, get_color_hex_from_code
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id



def find_by_audit_cycle_ids(audit_cycle_ids):
    return Question.objects.filter(section__audit_cycle_id__in=audit_cycle_ids)

def get_improvable_questions_by_audit_cycle(audit_cycle_ids, questionnaire_type_id, client_user):
    audit_cycle_ids = list(dict.fromkeys(audit_cycle_ids))
    valid_cycle_ids = list(AuditCycle.objects.filter(
            id__in=audit_cycle_ids,questionnaire_type_id=questionnaire_type_id,
            status__in=AuditCycle.LIVE_REPORTING_STATUSES
        ).values_list('id', flat=True)
    )
    if not valid_cycle_ids:
        return {
            'summary': {
                'total_questions': 0,
                'total_max_marks': 0,
                'total_obtained_marks': 0,
                'percentage': 0
            },
            'cycle_summary': [],
            'question_comparison': []
        }

    questions = find_by_audit_cycle_ids(valid_cycle_ids).filter(
        section__audit_cycle__questionnaire_type_id=questionnaire_type_id,
        section__audit_cycle__status__in=AuditCycle.LIVE_REPORTING_STATUSES,
        visibility=Question.VISIBLE_TO_ALL,hide_question=False
    ).values('id','max_marks','section__id','section__name','question_txt','section__audit_cycle_id'
    ).order_by('section__sequence','id')
    client_admin = client_user.is_client_admin()
    if not client_admin:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
    question_comparison = {}
    for question in questions:
        question_id = question['id']
        section_id = question['section__id']
        section_name = question['section__name']
        question_txt = question['question_txt']
        cycle_id = question['section__audit_cycle_id']
        max_marks = question['max_marks']
        if max_marks <= 0:
            continue
        answer_obj = find_answers_by_question_id_for_client(question_id).filter(
            audit_store__status__in=[AuditStore.COMPLETED,AuditStore.ACCEPTED],
            audit_store__audit__audit_cycle_id=cycle_id,
            audit_store__audit__audit_cycle__status__in=AuditCycle.LIVE_REPORTING_STATUSES,
            audit_store__report_sections__section_id=section_id,
            audit_store__report_sections__not_applicable=False,
            question__visibility=Question.VISIBLE_TO_ALL,
            question__hide_question=False
        )

        if not client_admin:
            answer_obj = answer_obj.filter(audit_store__audit__store__id__in=non_admin_user_store_list)
        na_count = answer_obj.filter(not_applicable=True).count()
        applicable_answers = answer_obj.filter(not_applicable=False)
        answer_count = applicable_answers.count()
        key = question_txt.strip() if question_txt else ''
        if not key:
            continue
        if key not in question_comparison:
            question_comparison[key] = {
                'section_id': section_id,
                'section_name': section_name,
                'question_txt': question_txt,
                'cycles': {}
            }
        if answer_count == 0:
            if na_count > 0:
                question_comparison[key]['cycles'][cycle_id] = {
                    'audit_cycle_id': cycle_id,
                    'question_id': question_id,
                    'max_marks': 'NA',
                    'obtained_marks': 'NA',
                    'lost_marks': 'NA',
                    'percentage': 'NA'
                }
            continue
        total_max_marks = max_marks * answer_count
        obtained_marks = applicable_answers.aggregate(sum_marks=Sum('marks_obtained'))['sum_marks'] or 0
        lost_marks = total_max_marks - obtained_marks
        percentage = round((float(obtained_marks) / total_max_marks) * 100, 2) if total_max_marks else 0
        question_comparison[key]['cycles'][cycle_id] = {
            'audit_cycle_id': cycle_id,
            'question_id': question_id,
            'max_marks': total_max_marks,
            'obtained_marks': obtained_marks,
            'lost_marks': lost_marks,
            'percentage': percentage
        }
    common_questions = []
    for question_data in question_comparison.values():
        cycles = question_data['cycles']
        if all(cycle_id in cycles for cycle_id in valid_cycle_ids):
            ordered_cycles = []
            for cycle_id in valid_cycle_ids:
                ordered_cycles.append(cycles[cycle_id])
            question_data['cycles'] = ordered_cycles
            common_questions.append(question_data)
    summary = {'total_questions': 0,'total_max_marks': 0,'total_obtained_marks': 0}
    cycle_summary = {}
    for question_data in common_questions:
        for cycle in question_data['cycles']:
            if cycle['percentage'] == 'NA':
                continue
            cycle_id = cycle['audit_cycle_id']
            summary['total_questions'] += 1
            summary['total_max_marks'] += cycle['max_marks']
            summary['total_obtained_marks'] += cycle['obtained_marks']
            if cycle_id not in cycle_summary:
                cycle_summary[cycle_id] = {
                    'audit_cycle_id': cycle_id,
                    'total_questions': 0,
                    'total_max_marks': 0,
                    'total_obtained_marks': 0
                }
            cycle_summary[cycle_id]['total_questions'] += 1
            cycle_summary[cycle_id]['total_max_marks'] += cycle['max_marks']
            cycle_summary[cycle_id]['total_obtained_marks'] += cycle['obtained_marks']
    summary['percentage'] = round( (float(summary['total_obtained_marks']) / summary['total_max_marks']) * 100, ) if summary['total_max_marks'] else 0
    common_questions = sorted(
        common_questions,
        key=lambda question: sum( cycle['lost_marks'] for cycle in question['cycles'] if cycle['lost_marks'] != 'NA'),
        reverse=True
    )
    return {
        'summary': summary,
        'cycle_summary': [ cycle_summary[cycle_id] for cycle_id in valid_cycle_ids if cycle_id in cycle_summary],
        'question_comparison': common_questions}

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


def get_improvable_questions_xlsx_by_audit_cycles(audit_cycle_ids, questionnaire_type_id, client_user):
    audit_cycles = list(
        AuditCycle.objects.filter(
            id__in=audit_cycle_ids,
            questionnaire_type_id=questionnaire_type_id,
            status__in=AuditCycle.LIVE_REPORTING_STATUSES
        )
    )
    cycle_map = {cycle.id: cycle for cycle in audit_cycles}
    audit_cycles = [cycle_map[cycle_id] for cycle_id in audit_cycle_ids if cycle_id in cycle_map]
    if not audit_cycles:
        return write_data([], []), 'Improvable Questions.xlsx'
    valid_cycle_ids = [cycle.id for cycle in audit_cycles]
    improvable_questions_data = get_improvable_questions_by_audit_cycle(
        valid_cycle_ids,
        questionnaire_type_id,
        client_user
    )
    data = create_text_structure(
        audit_cycles,
        improvable_questions_data
    )
    if len(audit_cycles) == 1:
        name = str(audit_cycles[0].name) + " Improvable Questions.xlsx"
    else:
        name = "Improvable Questions Summary.xlsx"
    name = name.replace("-", "")
    return write_data(data, audit_cycles), name


def create_text_structure(audit_cycles, improvable_questions_data):
    rows = []
    rows.append({
        'type': 'title',
        'content': 'Improvable Questions Summary'
    })
    rows.append({
        'type': 'header',
        'cycles': [
            {
                'audit_cycle_id': cycle.id,
                'audit_cycle_name': cycle.name
            }
            for cycle in audit_cycles
        ]
    })
    for question in improvable_questions_data.get('question_comparison', []):
        rows.append({
            'type': 'question',
            'section_name': question.get('section_name', ''),
            'question_txt': question.get('question_txt', ''),
            'cycles': question.get('cycles', [])
        })
    return rows

def write_data(data, audit_cycles):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet('Improvable Questions')

    title_format = workbook.add_format({
        'bold': True,
        'font_size': 18,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'text_wrap': True
    })

    section_format = workbook.add_format({
        'bold': True,
        'font_size': 13,
        'bg_color': '#BEBEBE',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': True
    })

    cycle_format = workbook.add_format({
        'bold': True,
        'font_size': 13,
        'bg_color': '#D9EAF7',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': True
    })

    question_format = workbook.add_format({
        'font_size': 12,
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })

    answer_format = workbook.add_format({
        'font_size': 12,
        'border': 1,
        'text_wrap': True,
        'valign': 'top',
        'align': 'center'
    })

    na_format = workbook.add_format({
        'font_size': 12,
        'border': 1,
        'text_wrap': True,
        'valign': 'top',
        'align': 'center'
    })

    cycle_count = len(audit_cycles)

    worksheet.set_column(0, 0, 35)
    worksheet.set_column(1, 1, 75)

    if cycle_count:
        worksheet.set_column(2, cycle_count + 1, 35)

    worksheet.set_default_row(35)

    row = 0

    worksheet.merge_range(
        row,
        0,
        row,
        cycle_count + 1,
        'Improvable Questions Summary',
        title_format
    )

    worksheet.set_row(row, 40)
    row += 2

    current_section = None

    for line in data:
        if line.get('type') == 'header':
            worksheet.write(row, 0, 'Section', section_format)
            worksheet.write(row, 1, 'Question', section_format)

            for index, cycle in enumerate(line.get('cycles', [])):
                cycle_name = cycle.get('audit_cycle_name', '')
                worksheet.write(
                    row,
                    index + 2,
                    cycle_name,
                    cycle_format
                )

            worksheet.set_row(row, 65)
            row += 1
            continue

        if line.get('type') != 'question':
            continue

        section_name = line.get('section_name', '')

        if section_name != current_section:
            current_section = section_name

            worksheet.merge_range(
                row,
                0,
                row,
                cycle_count + 1,
                section_name,
                section_format
            )

            worksheet.set_row(row, 35)
            row += 1

        worksheet.write(
            row,
            0,
            section_name,
            question_format
        )

        worksheet.write(
            row,
            1,
            line.get('question_txt', ''),
            question_format
        )

        cycle_map = {
            cycle.get('audit_cycle_id'): cycle
            for cycle in line.get('cycles', [])
        }

        for index, audit_cycle in enumerate(audit_cycles):
            cycle_id = audit_cycle.id
            column = index + 2

            cycle = cycle_map.get(cycle_id)

            if not cycle:
                worksheet.write(
                    row,
                    column,
                    'NA',
                    na_format
                )
                continue

            percentage = cycle.get('percentage', 'NA')
            obtained_marks = cycle.get('obtained_marks', 'NA')
            max_marks = cycle.get('max_marks', 'NA')
            lost_marks = cycle.get('lost_marks', 'NA')

            if percentage == 'NA':
                answer = 'NA'
            else:
                answer = (
                    'Obtained: {}\n'
                    'Total: {}\n'
                    'Lost: {}\n'
                    'Percentage: {}%'
                ).format(
                    obtained_marks,
                    max_marks,
                    lost_marks,
                    percentage
                )

            worksheet.write(
                row,
                column,
                answer,
                answer_format
            )

        worksheet.set_row(row, 100)
        row += 1

    worksheet.freeze_panes(3, 2)

    if row > 3:
        worksheet.autofilter(
            2,
            0,
            row - 1,
            cycle_count + 1
        )

    workbook.close()
    output.seek(0)
    return output