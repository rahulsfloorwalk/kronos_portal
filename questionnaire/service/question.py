from ..models import Question

def save(question):
    Question.save(question)
    return question
