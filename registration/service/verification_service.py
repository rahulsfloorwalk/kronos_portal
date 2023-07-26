import logging
from os import urandom
import hashlib
import datetime

from django.db.transaction import atomic
from django.utils import timezone

from kronos.exceptions import ObjectNotFound

from registration.models import Verification,OTPVerification

_logger = logging.getLogger(__name__)

def generate_activation_key_from_string(string):
    salt_hash_hexstr = hashlib.sha1(urandom(16)).hexdigest()
    email_hash_hexstr = hashlib.sha1(string.encode('utf-8')).hexdigest()
    cat_str = salt_hash_hexstr + email_hash_hexstr
    activation_key = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()
    return activation_key

def create_verification_for_user(user):
    verification = Verification()
    verification.user = user
    verification.activation_key = generate_activation_key_from_string(user.email)
    verification.key_expires = timezone.now() + datetime.timedelta(days=2)  # TODO: hardcoded verification expiry
    verification.save()
    return verification

def find_verification_by_user_id(user_id):
    try:
        return Verification.objects.get(user_id=user_id)
    except Verification.DoesNotExist as e:
        raise ObjectNotFound from e

def find_verification_by_activation_key(key):
    try:
        return Verification.objects.get(activation_key=key)
    except Verification.DoesNotExist as e:
        raise ObjectNotFound from e

def find_verification_by_otp(otp):
    try:
        return OTPVerification.objects.get(otp=otp)
    except OTPVerification.DoesNotExist as e:
        raise ObjectNotFound from e
@atomic
def verify_by_user_id(user_id):
    verification = find_verification_by_user_id(user_id)
    # FIXME: check if activation_key has expired
    if not verification.is_verified:
        verification.is_verified = True
        verification.save()
        _logger.debug("verified user %s successfully", verification.user)

        return verification
    else:
        _logger.debug("verification is already done for user: %s", verification.user)
        raise ObjectNotFound

@atomic
def verify_by_activation_key(activation_key):
    verification = find_verification_by_activation_key(activation_key)
    return verify_by_user_id(verification.user_id)

@atomic
def verify_by_otp(otp):
    otp = find_verification_by_otp(otp)
    return verify_by_user_id(otp.user)