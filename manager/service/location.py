from ..models import Location

def save(location):
    location.save()
    return location
