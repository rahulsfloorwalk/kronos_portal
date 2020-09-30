from collections import OrderedDict
from json import loads, dumps

states = OrderedDict()
# Indian States
states["IN-AN"] = "Andaman and Nicobar Islands"
states["IN-AP"] = "Andhra Pradesh"
states["IN-AR"] = "Arunachal Pradesh"
states["IN-AS"] = "Assam"
states["IN-BR"] = "Bihar"
states["IN-CH"] = "Chandigarh"
states["IN-CT"] = "Chhattisgarh"
states["IN-DN"] = "Dadra and Nagar Haveli"
states["IN-DD"] = "Daman and Diu"
states["IN-DL"] = "Delhi"
states["IN-GA"] = "Goa"
states["IN-GJ"] = "Gujarat"
states["IN-HR"] = "Haryana"
states["IN-HP"] = "Himachal Pradesh"
states["IN-JK"] = "Jammu and Kashmir"
states["IN-JH"] = "Jharkhand"
states["IN-KA"] = "Karnataka"
states["IN-KL"] = "Kerala"
states["IN-LD"] = "Lakshadweep"
states["IN-MP"] = "Madhya Pradesh"
states["IN-MH"] = "Maharashtra"
states["IN-MN"] = "Manipur"
states["IN-ML"] = "Meghalaya"
states["IN-MZ"] = "Mizoram"
states["IN-NL"] = "Nagaland"
states["IN-OR"] = "Odisha"
states["IN-PB"] = "Punjab"
states["IN-PY"] = "Puducherry"
states["IN-RJ"] = "Rajasthan"
states["IN-SK"] = "Sikkim"
states["IN-TN"] = "Tamil Nadu"
states["IN-TG"] = "Telangana"
states["IN-TR"] = "Tripura"
states["IN-UT"] = "Uttarakhand"
states["IN-UP"] = "Uttar Pradesh"
states["IN-WB"] = "West Bengal"

# Australian States
states["AU-CT"] = "Australian Capital Territory"
states["AU-NS"] = "New South Wales"
states["AU-NT"] = "Northern Territory"
states["AU-QL"] = "Queensland"
states["AU-SA"] = "South Australia"
states["AU-TA"] = "Tasmania"
states["AU-VI"] = "Victoria"
states["AU-WA"] = "Western Australia"

# Singapore States
states["SG-NA"] = "Singapore"

# England State
states["EN-NA"] = "England"

# New Zealand States
states["NZ-AL"] = "Auckland"
states["NZ-NL"] = "Northland"
states["NZ-BP"] = "Bay of Plenty"
states["NZ-HB"] = "Hawke's Bay"
states["NZ-GB"] = "Gisborne"
states["NZ-MW"] = "Manawatu-Whanganui"
states["NZ-TN"] = "Taranaki"
states["NZ-WK"] = "Waikato"
states["NZ-WT"] = "Wellington"
states["NZ-CB"] = "Canterbury"
states["NZ-OT"] = "Otago"
states["NZ-SL"] = "Southland"
states["NZ-WC"] = "West Coast"


def get_django_choices():
    choices = []
    for code, name in states.items():
        choices.append((code, name))
    return tuple(choices)


def get_state_dict(code):
    state = ''
    try:
        state = loads(dumps(states))[code]
    except KeyError:
        pass
    return state

def get_state_code(state_name):
    state_code = ''
    try:
        state_code = list(filter(lambda x: x[1] == state_name, get_django_choices()))[0][0]
    except IndexError:
        pass
    return state_code


def get_state_by_country(country):
    country_with_dash = country + "-"
    states_dict = OrderedDict()
    for code, name in states.items():
        if country_with_dash in code:
            states_dict[code] = name
    return states_dict
