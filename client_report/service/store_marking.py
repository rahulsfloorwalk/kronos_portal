from django.db.models import Q
from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit
from questionnaire.models import Question
from answer.models import Answer

def get_scores_for_store(store_id, client_id, audit_type):
    all_cycles = AuditCycle.objects.filter(client_id=client_id).filter(type=audit_type).order_by('end_date')
    if all_cycles.count() > 5:
        audit_cycles = all_cycles[all_cycles.count-5:]
    else:
        audit_cycles = all_cycles
    audit_cycle_master = [audit_cycle.name for audit_cycle in audit_cycles]
    master_questions = Question.objects.filter(section__audit_cycle__id=audit_cycles[len(audit_cycles)-1].id).order_by('section__sequence').order_by('sequence')
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
    questions = Question.objects.filter(section__audit_cycle__id=audit_cycle_id)
    response_data = []
    for question in questions:
        question_object = {}
        question_object['question_txt'] = question.question_txt
        question_object['score'] = get_average_score_for_question_in_audit_cycle(question.id, store_id)
        response_data.append(question_object)
    return response_data

def get_average_score_for_question_in_audit_cycle(question_id, store_id):

    answers = Answer.objects.filter(question_id=question_id)\
        .filter(Q(audit_store__status=AuditStore.COMPLETED) | Q(audit_store__status=AuditStore.ACCEPTED))\
        .filter(audit_store__audit__store__id=store_id)
    if len(answers) > 0:
        total = 0
        count = 0
        for answer in answers:
            if answer.marks_obtained is not None:
                total += answer.marks_obtained
                count += 1
        if count > 0:
            average = total/count
            print(count)
        else:
            average = -1
    else:
        average = -1
    return average

def transpose_data(master_questions, audit_cycle_scores):
    return audit_cycle_scores
