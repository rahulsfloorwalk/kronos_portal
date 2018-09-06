
from django.contrib.auth.models import User
from django.db.utils import DataError, IntegrityError

import datetime

import csv

from manager.states import states

from manager.models import City
from auditor.models import ProfileInfo
from registration.models import Verification, GROUP_NAME_AUDITOR

i = 0
v = 0

u_emails = 0
pi_succ = 0
pi_errs = 0

def get_city_by_name(name):
    name = name.strip()

    if 'kayamkulam'.upper() in name.upper():
        name = "Kayamkulam"
    if 'nabajagaran'.upper() in name.upper():
        name = "Barasat"
    if 'Lucknow'.upper() in name.upper():
        name = "Lucknow"
    if 'secunderabad'.upper() in name.upper():
        name = "Secunderabad"
    if 'pune'.upper() in name.upper():
        name = "Pune"
    if 'gurgaon'.upper() in name.upper():
        name = "Gurgaon"
    if 'bandra'.upper() in name.upper():
        name = "Mumbai"
    if 'mumbai'.upper() in name.upper():
        name = "Mumbai"
    if name.upper() == 'Yamuna Nagar'.upper():
        name = "Yamunanagar"
    if name.upper() == 'Dehra Dun'.upper():
        name = "Dehradun"
    if name.upper() == 'Bengaluru'.upper():
        name = "Bangalore"
    if name.upper() == 'Bangaluru'.upper():
        name = "Bangalore"
    if name.upper() == 'Cochin'.upper():
        name = "Kochi"
    if name.upper() == "New Delhi".upper():
        name = "Delhi"
    return City.objects.filter(name__iexact=name).all()

def get_state_by2(st2):
    if st2 == 'UL':
        return 'IN-UT'
    for k,v in states.items():
        if k.endswith(st2.upper()):
            return k
    return None


for u in User.objects.all():
    if u.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        try:
            ProfileInfo.objects.get(user_id=u.id)
        except ProfileInfo.DoesNotExist:
            i = i + 1
            with open('final_data.csv') as data:
                datar = csv.DictReader(data)
                found = False
                for row in datar:
                    if row["email"].lower() == u.email.lower():
                            found = True
                            if row["annual_house_hold_income"] is '':
                                income = None
                            else:
                                income = row["annual_house_hold_income"]
                            mobile = row["phone_mobile"][-10:]
                            dob = datetime.datetime.fromtimestamp(int(row['dob'])).strftime('%Y-%m-%d')
                            cities = get_city_by_name(row['city'])
                            state = get_state_by2(row['state'])
                            if state is None:
                                print("state not found {}".format(row["state"]))
                                pi_errs = pi_errs + 1
                            elif len(cities) > 1:
                                print("found multiple cities for {}".format(row["city"]))
                                pi_errs = pi_errs + 1
                            elif len(cities) == 0:
                                print("found zero cities for {}".format(row["city"]))
                                pi_errs = pi_errs + 1
                            else:
                                try:
                                    pi = ProfileInfo(
                                        user_id=u.id,
                                        date_of_birth=dob,
                                        mobile_number=mobile,
                                        first_name=row['fname'],
                                        last_name=row['lname'],
                                        gender=row['gender'],
                                        marital_status=row['marital_status'],
                                        education=row['highest_education'],
                                        household_income=income,
                                        address=row['address_1'],
                                        pincode=row['postal_code'],
                                        city=cities[0],
                                        state=state
                                    )
                                    pi.save()
                                    pi_succ = pi_succ + 1
                                except AttributeError as e:
                                    print("attriberror at profile", e)
                                    pi_errs = pi_errs + 1
                                except ValueError as e:
                                    print("valueerror at profile", e)
                                    pi_errs = pi_errs + 1
                                except DataError as e:
                                    print("dataerror at profile", e)
                                    pi_errs = pi_errs + 1
                                except IntegrityError as e:
                                    print("IntegrityError at profile", e)
                                    pi_errs = pi_errs + 1
                if not found:
                    u_emails = u_emails + 1
                    print("email not found:", u.email)

        try:
            Verification.objects.get(user_id=u.id)
        except Verification.DoesNotExist:
            v = v + 1

print("found {} unknown emails".format(u_emails))
print("found no profiles for {} auditors".format(i))
print("inserted profiles for {} auditors".format(pi_succ))
print("ERRORED  profiles for {} auditors".format(pi_errs))

print("found no verifications for {} auditors".format(v))
