from django.contrib.auth.models import User, Group
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from django.db.utils import DataError, IntegrityError
from registration.models import Verification
import hashlib, datetime
import properties
from os import urandom
import csv
with open('final_data.csv') as data:
    datar = csv.DictReader(data)
    for row in datar:
        try:
            user = User.objects.create_user(username=row['username'], email=row['email'], password=row['password'])
            user.groups.add(Group.objects.get(id=1))
        except AttributeError:
            print("attriberror at user")
        except ValueError:
            print("valueerror at user")
        except DataError:
            print("dataerror at user")
        try:
            dob = datetime.datetime.fromtimestamp(int(row['dob'])).strftime('%Y-%m-%d')
            pi = ProfileInfo(user_id=user.id, date_of_birth=dob, mobile_number=row['phone_mobile'], first_name=row['fname'], last_name=row['lname'], gender=row['gender'], marital_status=row	['marital_status'], education=row['highest_education'], household_income=row['annual_house_hold_income'], address=row['address_1'], pincode=row['postal_code'], city=row['city'], state=row['state'])
            pi.save()
        except AttributeError:
            print("attriberror at profile")
        except ValueError:
            print("valueerror at profile")
        except DataError:
            print("dataerror at profile")
        except IntegrityError:
            print("IntegrityError at profile")
        try:
            verification = Verification()
            verification.user = user
            verification.key_expires = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=30), "%Y-%m-%d %H:%M:%S")
            cat_str = hashlib.sha1(urandom(16)).hexdigest() + hashlib.sha1(row['email'].encode('utf-8')).hexdigest()
            verification.activation_key = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()
            verification.is_verified = True
            verification.save()
        except AttributeError:
            print("attriberror at profile")
        except ValueError:
            print("valueerror at profile")
        except DataError:
            print("dataerror at profile")
        except IntegrityError:
            print("IntegrityError at profile")
        try:
            bi = BankInfo(user_id=user.id, bank_name=row['bank_name'], account_holder_name=row['account_holder_name'], account_number=row['account_number'], ifsc_code=row['ifsc_code'], pan_number=row['pan'], bank_address=row['bank_address'])
            bi.save()
        except AttributeError:
            print("attriberror at bank")
        except ValueError:
            print("valueerror at bank")
        except DataError:
            print("dataerror at bank")
        except IntegrityError:
            print("IntegrityError at profile")
        try:
            ai = AdditionalInfo(user_id=user.id, height=row['height'], weight=row['weight'], distance=row['distance_willing_to_travel'])
            ai.save()
        except AttributeError:
            print("attriberror at add")
        except ValueError:
            print("valueerror at add")
        except DataError:
            print("dataerror at add	")
        except IntegrityError:
            print("IntegrityError at profile")
