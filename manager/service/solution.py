from ..models import MPSolutions
from django.db.utils import IntegrityError

from kronos.exceptions import ObjectNotFound,AppLogicError
def find_all_solutions():
    return MPSolutions.objects.all()

def save(solution):
    solution.save()
    return solution

def find_solution_by_id(solution_id):
    try:
        return MPSolutions.objects.get(pk=solution_id)
    except MPSolutions.DoesNotExist as e:
        raise ObjectNotFound from e

def delete(solution_id):
    try:
        solution = find_solution_by_id(solution_id)
        solution.delete()
    except IntegrityError as e:
        raise AppLogicError("solution cannot be delete now") from e
