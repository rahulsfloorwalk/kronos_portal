from manager.models import MPSolutionQuestion
def save(question):
    question.full_clean(exclude=["question_data"])
    MPSolutionQuestion.save(question)
    return question
    