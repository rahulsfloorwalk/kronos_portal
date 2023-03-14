
from kronos.exceptions import ObjectNotFound
from manager.models import City

def find_cities_by_state_code(state_code):
    return City.objects.filter(state=state_code)

def find_city_by_id(city_id):
    try:
        return City.objects.get(pk=city_id)
    except City.DoesNotExist as e:
        raise ObjectNotFound from e
