from collections import OrderedDict
from json import loads, dumps

country = OrderedDict()
country["AU"] = "Australia"
country["BD"] = "Bangladesh"
country["BE"] = "Belgium"
country["CA"] = "Canada"
country["CZ"] = "Czech"
# country["CN"] = "China"
country["GB"] = "England"
country["FR"] = "France"
country["DE"] = "Germany"
country["IN"] = "India"
country["IT"] = "Italy"
country["JP"] = "Japan"
country["KE"] = "Kenya"
country["MY"] = "Malaysia"
country["NG"] = "Nigeria"
country["NP"] = "Nepal"
country["NZ"] = "New Zealand"
country["NL"] = "Netherland"
country["PK"] = "Pakistan"
country["PL"] = "Poland"
country["SG"] = "Singapore"
country["ES"] = "Spain"
country["LK"] = "Shrilanka"
country["CH"] = "Switzerland"
country["US"] = "United States"
country["TH"] = "Thailand"
country["UE"] = "United Arab Emirates"


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
