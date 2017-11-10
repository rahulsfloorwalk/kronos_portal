import logging
from django.conf import settings
from django.db import IntegrityError
from django.contrib.auth.models import User, Group
from django.db.models import Q
from django.forms import ValidationError
from django.contrib.auth.forms import PasswordResetForm
from django.core.validators import validate_email
from django.db.transaction import atomic

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import Verification
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo, AdditionalInfo
from referral.service import referral_auditor

_logger = logging.getLogger(__name__)

def find_auditor_by_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.get(pk=user_id)
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e

@atomic
def deactivate_auditor(user_id):
    user = find_auditor_by_id(user_id)
    user.is_active = False
    user.save()
    return user

@atomic
def activate_auditor(user_id):
    user = find_auditor_by_id(user_id)
    user.is_active = True
    user.save()
    return user

def find_verification_by_key(key):
    try:
        return Verification.objects.get(activation_key=key)
    except Verification.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def verify_auditor(user_id):
    try:
        user = find_auditor_by_id(user_id)
        if not user.verification.is_verified:
            user.verification.is_verified = True
            user.verification.save()
            _logger.info("verified user %s successfully", user)
            referral_auditor.trigger_signup_referral(user.id)
            return user
        else:
            _logger.info("verification is already done for user: %s", user.email)
            raise ObjectNotFound
    except (User.DoesNotExist, Verification.DoesNotExist) as e:
        raise ObjectNotFound from e


@atomic
def verify_auditor_by_key(key):
    verification = find_verification_by_key(key)
    _logger.info("found verification for key: %s", key)
    return verify_auditor(verification.user_id)


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
            domain_override=settings.BASE_DOMAIN_NAME,
            extra_email_context = {
                'mydomain': settings.BASE_DOMAIN_NAME
            }
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


def check_email_exists(to_check_email):
    if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
        return True
    else:
        return False

def check_phone_exists(phone_number):
    if ProfileInfo.objects.filter(mobile_number=phone_number).exists():
        return True
    else:
        return False
