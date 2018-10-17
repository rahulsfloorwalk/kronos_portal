from django.db.models import Prefetch
from audit_store.models import AuditStore
from audit.models import AuditCycle
from questionnaire.models import Question
from answer.models import Answer
from kronos.utils import get_color_code


def get_scores_graph_for_store_by_questionnaire_type(store_id, client_id, questionnaire_type_id):
    all_cycles = AuditCycle.objects.filter(
        client_id=client_id,
        status__in=AuditCycle.TRENDABLE_STATUSES,
        questionnaire_type_id=questionnaire_type_id,
    ).order_by('end_date')

    all_cycle_count = all_cycles.count()

    if all_cycle_count is 0:
        return {"scores": [], "audit_cycle": []}

    if all_cycle_count > 5:
        audit_cycles = all_cycles[all_cycle_count - 5:]
    else:
        audit_cycles = all_cycles

    scores_list = []
    audit_cycles_list = []
    max_scores_list = []
    for audit_cycle in audit_cycles:
        marks = get_question_wise_marks_for_audit_cycle(audit_cycle.id, store_id)
        total = 0
        max_marks = 0
        for mark in marks:
            score = mark.get('score', {}).get('marks', 0)
            total += score if score is not None else 0
            max_marks += mark.get('max_marks', 0)
        audit_cycles_list.append(audit_cycle.name)
        scores_list.append(total)
        max_scores_list.append(max_marks)
    return {"scores": scores_list, "audit_cycle": audit_cycles_list, "max_marks": max_scores_list}

def get_scores_for_store_by_questionnaire_type(store_id, client_id, questionnaire_type_id):
    all_cycles = AuditCycle.objects.filter(
        client_id=client_id,
        status__in=AuditCycle.LIVE_REPORTING_STATUSES,
        questionnaire_type_id=questionnaire_type_id,
    ).order_by('end_date')

    all_cycle_count = all_cycles.count()

    if all_cycle_count is 0:
        return {"scores": [], "audit_cycle": []}

    if all_cycle_count > 5:
        audit_cycles = all_cycles[all_cycle_count - 5:]
    else:
        audit_cycles = all_cycles

    audit_cycle_master = [audit_cycle.name for audit_cycle in audit_cycles]

    master_questions = Question.objects.filter(section__audit_cycle__id=audit_cycles[len(audit_cycles) - 1].id) \
        .order_by('section__sequence') \
        .order_by('sequence') \
        .select_related('section')

    raw_data = []
    for audit_cycle in audit_cycles:
        obj = {}
        obj['audit_cycle'] = audit_cycle.name
        obj['data'] = get_question_wise_marks_for_audit_cycle(audit_cycle.id, store_id)
        raw_data.append(obj)

    response_data = {}
    response_data['scores'] = transpose_data(master_questions, raw_data)
    response_data['audit_cycle'] = audit_cycle_master
    return response_data

def get_question_wise_marks_for_audit_cycle(audit_cycle_id, store_id):
    questions = Question.objects.filter(section__audit_cycle__id=audit_cycle_id) \
        .select_related('section') \
        .prefetch_related(
            Prefetch('answers', queryset=Answer.objects.filter(
                audit_store__status__in=(AuditStore.COMPLETED, AuditStore.ACCEPTED),
                audit_store__audit__store_id=store_id,
            )),
    )

    response_data = []
    for question in questions:
        question_object = {}
        question_object['question_txt'] = question.question_txt
        question_object['section_name'] = question.section.name
        question_object['section_sequence'] = question.section.sequence
        question_object['sequence'] = question.sequence
        question_object['max_marks'] = question.max_marks
        question_object['score'] = get_average_score_for_question_in_audit_cycle(question, store_id)
        response_data.append(question_object)
    return response_data

def get_average_score_for_question_in_audit_cycle(question, store_id):

    total = 0
    count = 0
    average = None

    for answer in question.answers.all():
        if answer.marks_obtained is not None and not answer.not_applicable:
            total += answer.marks_obtained
            count += 1
    if count > 0:
        average = total / count

    return {
        "marks": average,
        "color": get_color_code(average, question.max_marks) if average is not None else None,
    }

def transpose_data(master_questions, audit_cycle_scores):
    response_data = []
    for question in master_questions:
        obj = {}
        obj['question_id'] = question.id
        obj['sequence'] = question.sequence
        obj['max_marks'] = question.max_marks
        obj['question_txt'] = question.question_txt
        obj['scores'] = []
        for dataline in audit_cycle_scores:
            for scoreline in dataline.get('data'):
                if question.question_txt == scoreline.get('question_txt')\
                    and question.section.name == scoreline.get('section_name')\
                        and question.sequence == scoreline.get('sequence'):
                    obj['scores'].append(scoreline.get('score'))
                    obj['section_name'] = scoreline.get('section_name')
                    obj['section_sequence'] = scoreline.get('section_sequence')

        response_data.append(obj)

    sorted_by_sequence = sorted(response_data, key=lambda x: x['sequence'])
    sorted_by_section = sorted(sorted_by_sequence, key=lambda x: x['section_sequence'])

    return sorted_by_section
