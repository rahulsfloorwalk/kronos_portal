from django.db import IntegrityError

from kronos.exceptions import AppLogicError, ObjectNotFound

from ..models import Location

def find_location_by_id(location_id):
    try:
        return Location.objects.get(pk=location_id)
    except Location.DoesNotExist as e:
        raise ObjectNotFound from e

def save(location):
    location.save()
    return location

def delete_location_by_id(location_id):
    try:
        location = find_location_by_id(location_id)
        location.delete()
    except IntegrityError as e:
        raise AppLogicError("location is not deletable now") from e
