import os
import json

from django.conf import settings
from django.contrib.auth.models import User, Group
from django.utils import timezone
from django.db import transaction

from auditor.models import ProfileInfo, AdditionalInfo, Preferences, BankInfo
from registration.models import OTPVerification
from registration.service.auditor import generate_ref_code
from payment.service.payment_beneficiary import create_beneficiary_id_for_user
from django.db import DataError, IntegrityError

from manager.models import City

from datetime import datetime
import re

# from auditor.service.bulk_auditor_add import import_auditors_from_json
# import_auditors_from_json()


# first update bulk_auditor_add.json 
# then go to python manage.py shell  then
# from auditor.service.bulk_auditor_add import import_auditors_from_json
# import_auditors_from_json()


def clean(value):
    if value is None:
        return None

    value = str(value)
    value = value.replace("\xa0", "").strip()

    if value == "":
        return None
    return value

def clean_education(value):
    from auditor.models import ProfileInfo

    value = clean(value)

    field = ProfileInfo._meta.get_field('education')
    choices = [c[0] for c in field.choices]

    if value in choices:
        return value

    for choice in choices:
        if value and value.lower() == choice.lower():
            return choice

    return choices[0] if choices else None


def clean_date(value):
    """
    Converts:
    - DD/MM/YYYY
    - DD-MM-YYYY
    - YYYY-MM-DD
    - Removes hidden spaces (\xa0)
    - Returns Python date object
    """

    if not value:
        return None

    value = str(value)

    value = value.replace("\xa0", "")
    value = value.strip()
    value = re.sub(r"[^\d/-]", "", value)

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except:
            continue

    print(" Could not parse date:", value)
    return None

def import_auditors_from_json():
    file_path = os.path.join(settings.BASE_DIR, "bulk_auditor_add.json")
    if not os.path.exists(file_path):
        print(" JSON file not found at:", file_path)
        return

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    group = Group.objects.get(name="Auditor")

    for row in data:
        email = row.get("email", "").strip().lower()
        phone = clean(row.get("phone"))
        try:
            if not email:
                print("Skipping row without email")
                continue

            if User.objects.filter(email=email).exists():
                print("Skipping existing:", email)
                continue

            with transaction.atomic():
                user = User(username=email,email=email,is_active=True)
                user.set_password(row.get("password", "123456"))
                user.full_clean()
                user.save()
                user.groups.add(group)

                city_code = clean(row.get("City_code"))
                city_instance = None

                if city_code:
                    city_instance = City.objects.filter(id=city_code).first()
                    if not city_instance:
                        print("City not found for code:", city_code)

                now = timezone.now()
                profile = ProfileInfo(
                    user=user,
                    # pronouns=clean(row.get("pronouns")) or "hh",
                    first_name=clean(row.get("first_name")),
                    last_name=clean(row.get("last_name")),
                    gender=clean(row.get("gender")),
                    city=city_instance,
                    # marital_status=clean(row.get("marital_status")),
                    # education=clean_education(row.get("education")),
                    # household_income=clean(row.get("household_income")),
                    # dial_code=clean(row.get("dial_code")),
                    # whatsapp_dial_code=clean(row.get("whatsapp_dial_code")),
                    dial_code=clean(row.get("Mobile_country_code")),
                    mobile_number=clean(row.get("phone")),
                    # whatsapp_number=clean(row.get("whatsapp_number")),
                    date_of_birth=clean_date(row.get("date_of_birth")),
                    address=clean(row.get("address")),
                    pincode=clean(row.get("pincode")),
                    certification_score=clean(row.get("certification_score")) or 65,
                    # auditor_rating=clean(row.get("auditor_rating")) or "E",
                    created_at=now,
                    modified_at=now,
                )
                try:
                    profile.save()
                except DataError as e:
                    # print(" DATABASE ERROR for:", email)
                    # print(" Raw DB Error:", str(e))

                    for field in profile._meta.fields:
                        value = getattr(profile, field.name)
                        # if isinstance(value, str):
                        #     print(f"{field.name} = '{value}' (length={len(value)})")
                    raise

                additional = AdditionalInfo.objects.create(
                    user=user,
                    camera_owned=clean(row.get("camera_owned")),
                )

                # additional.referral_code = generate_ref_code(email, phone)
                additional.save()
                BankInfo.objects.create(
                    user=user,
                    bank_name=clean(row.get("bank_name")) or "SBI",
                    bank_address=clean(row.get("bank_address")) or "Shri lanka",
                    account_holder_name=clean(row.get("account_holder_name")),
                    account_number=clean(row.get("account_number")),
                    ifsc_code=clean(row.get("ifsc_code")),
                    # pan_number=clean(row.get("pan_number")),
                    # paypal=clean(row.get("paypal")),
                )

                Preferences.objects.create(
                    user=user,
                    receive_new_opportunities_email=row.get("receive_new_opportunities_email", True),
                    receive_transactional_email=row.get("receive_transactional_email", True),
                    receive_new_opportunities_sms=row.get("receive_new_opportunities_sms", True),
                    receive_transactional_sms=row.get("receive_transactional_sms", True),
                    receive_transactional_whatsapp_message=row.get("receive_transactional_whatsapp_message", True),
                    agreement_accepted=True,
                    pp_accepted=True,
                    full_time_opportunity_email_status=row.get("full_time_opportunity_email_status", False),
                )

                OTPVerification.objects.create(user=user,otp="1234",is_verified=True,otp_expires=timezone.now())
                create_beneficiary_id_for_user(user)
                print(" Created:", email)

        except Exception as e:
            import traceback
            print(" Error:", email)
            traceback.print_exc()


    print("\n Import Completed Successfully")