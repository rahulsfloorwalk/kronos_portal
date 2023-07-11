from manager.models import MPSolutionQuestion
def save(question):
    question.full_clean(exclude=["question_data"])
    MPSolutionQuestion.save(question)
    return question
    
def find_questions_by_solution_id(solution_id):
    return MPSolutionQuestion.objects.filter(solution_id=solution_id).all()