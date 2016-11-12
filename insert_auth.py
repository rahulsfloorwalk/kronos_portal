from django.contrib.auth.models import User
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from django.db.utils import DataError
import csv
with open('final_data.csv') as data:
    datar = csv.DictReader(data)
    for row in datar:
        try:
            user = User.objects.create_user(username=row['username'], email=row['email'], password=row['password'])
            pi = ProfileInfo(user_id=user.id, mobile_number=row['phone_mobile'], first_name=row['fname'], last_name=row['lname'], gender=row['gender'], marital_status=row['marital_status'], education=row['highest_education'], household_income=row['annual_house_hold_income'], address=row['address_1'], pincode=row['postal_code'], city=row['city'], state=row['state'])
            pi.save()
            bi = BankInfo(user_id=user.id, bank_name=row['bank_name'], account_holder_name=row['account_holder_name'], account_number=row['account_number'], ifsc_code=row['ifsc_code'], pan_number=row['pan'], bank_address=row['bank_address'])
            bi.save()
            ai = AdditionalInfo(user_id=user.id, height=row['height'], weight=row['weight'], distance=row['distance_willing_to_travel'])
            ai.save()
        except AttributeError:
            print("attriberror")
        except ValueError:
            print("valueerror")
        except DataError:
            print("dataerror")
