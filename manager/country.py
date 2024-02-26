from collections import OrderedDict
from json import loads, dumps

country = OrderedDict()
country["AU"] = "Australia"
country["EN"] = "England"
country["IN"] = "India"
country["NZ"] = "New Zealand"
country["SG"] = "Singapore"
country["US"] = "United States"
country["CA"] = "Canada"
country["UE"] = "United Arab Emirates"
country["MY"] = "Malaysia"
country["NG"] = "Nigeria"
country["CH"] = "Switzerland"
country["TH"] = "Thailand"


def get_country_django_choices():
    choices = []
    for code, name in country.items():
        choices.append((code, name))
    return tuple(choices)


def get_country_dict(code):
    country_name = ''
    try:
        country_name = loads(dumps(country))[code]
    except KeyError:
        pass
    return country_name


def get_country_code(country_name):
    country_code = ''
    try:
        country_code = list(filter(lambda x: x[1] == country_name, get_country_django_choices()))[0][0]
    except IndexError:
        pass
    return country_code
