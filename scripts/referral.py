from django.db import IntegrityError
from auditor.models import ProfileInfo, AdditionalInfo

def insert_referral_codes():
    pis = ProfileInfo.objects.all()
    for pi in pis:
        user = pi.user
        mobile = pi.mobile_number
        email = (''.join(e for e in user.email if e.isalnum())).lower()
        if mobile is None or email is None:
            continue
        ref_code = generate_ref_code(email, mobile)
        try:
            ai = AdditionalInfo.objects.get(user=user)
        except AdditionalInfo.DoesNotExist:
            newai = AdditionalInfo()
            newai.user = user
            ai.save()

        ai.referral_code = ref_code
        try:
            ai.save()
        except IntegrityError:
            print("Collision unresolved for user " + user.email)
            pass


def generate_ref_code(email, phone):
    ref_code = email[:4] + phone[-4:]
    ref_code_final = ref_code
    is_duplicate = AdditionalInfo.objects.filter(referral_code=ref_code)
    filler = 'a'
    while is_duplicate:
        ref_code_final = ref_code + filler
        filler = chr(ord(filler) + 1)
        is_duplicate = AdditionalInfo.objects.filter(referral_code=ref_code_final)

    return ref_code_final


