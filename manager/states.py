from collections import OrderedDict
from json import loads, dumps

states = OrderedDict()
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
