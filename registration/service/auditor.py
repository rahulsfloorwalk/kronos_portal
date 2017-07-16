import logging
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo, AdditionalInfo

_logger = logging.getLogger(__name__)

def deactivate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = False
        user.save()
        return user
    else:
        raise ObjectNotFound

def activate_auditor(user_id):
    user = User.objects.get(pk=user_id)
    if user and user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user.is_active = True
        user.save()
        return user
    else:
        raise ObjectNotFound

def verify_auditor(user_id):
    try:
        user = User.objects.get(pk=user_id)
        if user.groups.filter(name=GROUP_NAME_AUDITOR).exists() and not user.verification.is_verified:
            user.verification.is_verified = True
            user.verification.save()
            return user
        else:
            raise ObjectNotFound
    except User.DoesNotExist as e:
        raise ObjectNotFound from e

def insert_referral_code(user_id):
    user = User.objects.get(pk=user_id)
    profile_info = ProfileInfo.objects.get(user_id=user_id)
    ref_code = generate_ref_code(user.email, profile_info.mobile_number)
    try:
        additional_info = AdditionalInfo.objects.get(user_id=user.id)
    except AdditionalInfo.DoesNotExist:
        additional_info = AdditionalInfo(user_id=user_id)
        additional_info.save()
    additional_info.referral_code = ref_code
    try:
        with transaction.atomic():
            additional_info.save()
    except IntegrityError:
        _logger.error("Collision for referral code unresolved for user %s. Skipping generation of referral code", user.email)
        pass

# Assumption is that same combination of email[:4] and phone[-4:] will not collide more than 26 times
# Data set while generating codes indicated 1 collision for every 1500 entries.
# Thus, probability that same collision will happen more than 26 times is (1/1500)^26
# Note that phone numbers are NOT random hence actual probability may be higher, but still negligible
def generate_ref_code(email_original, phone):
    email = (''.join(e for e in email_original if e.isalnum())).lower()
    ref_code = email[:4] + phone[-4:]
    ref_code_final = ref_code
    is_duplicate = AdditionalInfo.objects.filter(referral_code=ref_code)
    filler = 'a'
    while is_duplicate:
        ref_code_final = ref_code + filler
        filler = chr(ord(filler) + 1)
        is_duplicate = AdditionalInfo.objects.filter(referral_code=ref_code_final)

    return ref_code_final
