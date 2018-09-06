import googlemaps
from decimal import Decimal

#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kronos.settings")

from manager.models import City
from manager.states import states

gmaps = googlemaps.Client(key='INSERT_KEY_HERE')

def get_lat_long(search_str):
    print("searching by str: ", search_str)

    # Geocoding an address
    geocode_result = gmaps.geocode(search_str)

    if len(geocode_result) == 1:
        lat = geocode_result[0]['geometry']['location']['lat']
        lon = geocode_result[0]['geometry']['location']['lng']
        print("Found location: ", lat, lon)
        return lat, lon
    else:
        print("Found multiple")
        return None, None


cities = City.objects.all()

for city in cities:
    if city.lat is None:
        search_str = "{}, {}, {}".format(city.name, states.get(city.state), "India")
        lat, lon = get_lat_long(search_str)

        if None not in (lat, lon):
            city.lat = Decimal(lat)
            city.lon = Decimal(lon)
            city.save()


