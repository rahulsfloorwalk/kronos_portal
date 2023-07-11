from manager.models import MPSolution
from kronos.exceptions import ObjectNotFound
def find_by_id(solution_id):
    try:
        return MPSolution.objects.get(pk=solution_id)
    except MPSolution.DoesNotExist as e:
        raise ObjectNotFound from e
