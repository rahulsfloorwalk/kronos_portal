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

# Australian States.
states["AU-CT"] = "Australian Capital Territory"
states["AU-NS"] = "New South Wales"
states["AU-NT"] = "Northern Territory"
states["AU-QL"] = "Queensland"
states["AU-SA"] = "South Australia"
states["AU-TA"] = "Tasmania"
states["AU-VI"] = "Victoria"
states["AU-WA"] = "Western Australia"
states["AU-BB"] = "Brisbane"
states["AU-MB"] = "Melbourne"
states["AU-SN"] = "Sydney"

# Canada States
states["CA-OT"] = "Ontario"
states["CA-MT"] = "Montreal"
states["CA-OW"] = "Otawa"

# Dubai States
states["UE-DB"] = "Dubai"

# Malaysia States
states["MY-KL"] = "Kuala Lampur"
states["MY-JB"] = "Johor Bahru"


# Nigeria States
states["NG-LG"] = "Lagos"

# Switzerland States
states["CH-WT"] = "Winterthur"

# Thailand States
states["TH-BK"] = "Bangkok"


# Singapore States
states["SG-NA"] = "Singapore"

# England State
states["EN-NA"] = "England"

# New Zealand States
states["NZ-AL"] = "Auckland"
states["NZ-BP"] = "Bay of Plenty"
states["NZ-CB"] = "Canterbury"
states["NZ-GB"] = "Gisborne"
states["NZ-HB"] = "Hawke's Bay"
states["NZ-MW"] = "Manawatu-Whanganui"
states["NZ-NL"] = "Northland"
states["NZ-OT"] = "Otago"
states["NZ-SL"] = "Southland"
states["NZ-TN"] = "Taranaki"
states["NZ-WK"] = "Waikato"
states["NZ-WT"] = "Wellington"
states["NZ-WC"] = "West Coast"

# US States
states["US-AL"] = "Alabama"
states["US-AK"] = "Alaska"
states["US-AZ"] = "Arizona"
states["US-AR"] = "Arkansas"
states["US-CA"] = "California"
states["US-CO"] = "Colorado"
states["US-CT"] = "Connecticut"
states["US-DE"] = "Delaware"
states["US-DC"] = "District of Columbia"
states["US-FL"] = "Florida"
states["US-GA"] = "Georgia"
states["US-HI"] = "Hawaii"
states["US-ID"] = "Idaho"
states["US-IL"] = "Illinois"
states["US-IN"] = "Indiana"
states["US-IA"] = "Iowa"
states["US-KS"] = "Kansas"
states["US-KY"] = "Kentucky"
states["US-LA"] = "Louisiana"
states["US-ME"] = "Maine"
states["US-MD"] = "Maryland"
states["US-MA"] = "Massachusetts"
states["US-MI"] = "Michigan"
states["US-MN"] = "Minnesota"
states["US-MS"] = "Mississippi"
states["US-MO"] = "Missouri"
states["US-MT"] = "Montana"
states["US-NE"] = "Nebraska"
states["US-NV"] = "Nevada"
states["US-NH"] = "New Hampshire"
states["US-NJ"] = "New Jersey"
states["US-NM"] = "New Mexico"
states["US-NY"] = "New York"
states["US-NC"] = "North Carolina"
states["US-ND"] = "North Dakota"
states["US-OH"] = "Ohio"
states["US-OK"] = "Oklahoma"
states["US-OR"] = "Oregon"
states["US-PA"] = "Pennsylvania"
states["US-PR"] = "Puerto Rico"
states["US-RI"] = "Rhode Island"
states["US-SC"] = "South Carolina"
states["US-SD"] = "South Dakota"
states["US-TN"] = "Tennessee"
states["US-TX"] = "Texas"
states["US-UT"] = "Utah"
states["US-VT"] = "Vermont"
states["US-VA"] = "Virginia"
states["US-WA"] = "Washington"
states["US-WV"] = "West Virginia"
states["US-WI"] = "Wisconsin"
states["US-WY"] = "Wyoming"
states["US-IV"] = "Irvine"


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
