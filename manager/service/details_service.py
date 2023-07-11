from manager.models import MPSolutionOtherDetails
def save(details):
    MPSolutionOtherDetails.save(details)
    return details