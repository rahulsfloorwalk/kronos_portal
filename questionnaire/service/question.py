from ..models import Question

def save(question):
    Question.save(question)
    return question

def find_by_audit_cycle(audit_cycle_id):
    questions = Question.objects.filter(section__audit_cycle_id=audit_cycle_id)
    return questions

def find_by_audit_cycle_and_id(audit_cycle_id, question_id):
    try:
        return Question.objects.get(section__audit_cycle_id=audit_cycle_id, pk=question_id)
    except Question.DoesNotExist as e:
        raise ObjectNotFound from e
