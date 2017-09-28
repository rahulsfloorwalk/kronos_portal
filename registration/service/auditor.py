import logging
import properties
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User
from django.forms import ValidationError
from django.contrib.auth.forms import PasswordResetForm
from django.core.validators import validate_email

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo, AdditionalInfo

_logger = logging.getLogger(__name__)

def find_auditor_by_id(user_id):
    try:
        user = User.objects.get(pk=user_id)
        if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            return user
    except User.DoesNotExiste:
        pass
    raise ObjectNotFound from e

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

def set_email(user_id, email):
    if not email:
        raise AppLogicError("invalid email")
    to_store_email = email.strip().lower()
    try:
        validate_email(to_store_email)
        user = find_auditor_by_id(user_id)
        user.email = to_store_email
        user.username = to_store_email
        user.save()
        return user
    except ValidationError as e:
        raise AppLogicError("invalid email") from e
    except IntegrityError as e:
        raise AppLogicError("email already exists in system") from e

def send_password_reset_email(user_id):
    user = find_auditor_by_id(user_id)
    form = PasswordResetForm({'email': user.email})
    if form.is_valid():
        form.save(
            subject_template_name='registration/password_reset_subject2.txt',
            email_template_name='registration/password_reset_email2.txt',
            html_email_template_name='registration/password_reset_email2.html',
            domain_override=properties.MY_DOMAIN,
        )
        return user
    else:
        return None

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
