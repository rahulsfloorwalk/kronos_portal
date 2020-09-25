from collections import OrderedDict
from json import loads, dumps

country = OrderedDict()
country["AU"] = "Australia"
country["IN"] = "India"
country["NZ"] = "New Zealand"
country["UK"] = "United Kingdom"


def get_country_django_choices():
    choices = []
    for code, name in country.items():
        choices.append((code, name))
    return tuple(choices)


def get_country_dict(code):
    country = ''
    try:
        country = loads(dumps(country))[code]
    except KeyError:
        pass
    return country


def get_country_code(country_name):
    country_code = ''
    try:
        country_code = list(filter(lambda x: x[1] == country_name, get_country_django_choices()))[0][0]
    except IndexError:
        pass
    return country_code
