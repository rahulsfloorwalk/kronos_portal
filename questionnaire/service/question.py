from ..models import Question

def save(question):
    Question.save(question)
    return question

def find_by_audit_cycle(audit_cycle_id):
    questions = Question.objects.filter(section__audit_cycle_id=audit_cycle_id)
    return questions
