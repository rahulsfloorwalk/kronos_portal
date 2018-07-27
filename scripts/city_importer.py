import csv
from django.db.transaction import atomic
from manager.models import City
from scripts import geocode


def import_cities(filename):
    city_list = []
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            city_name = row['city_name'].title()
            state_code = row['state_code'].upper()
            city_str = "{}, {}, {}".format(city_name, state_code, "India")
            lat, lon = geocode.get_lat_long(city_str)
            city = City()
            city.name = city_name
            city.state = state_code
            city.lat = lat
            city.lon = lon
            city_list.append(city)
    return city_list


@atomic
def write_cities(city_list):
    for city in city_list:
        city.save()
