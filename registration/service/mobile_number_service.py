import random
import string
import logging
import datetime

from django.utils import timezone

from kronos.exceptions import ObjectNotFound, AppLogicError

from auditor.models import ProfileInfo
from registration.models import MobileNumber

_logger = logging.getLogger(__name__)

def mobile_number_exists(mobile_number):
    if ProfileInfo.objects.filter(mobile_number=mobile_number).exists():
        return True

    if MobileNumber.objects.filter(mobile_number=mobile_number).exists():
        return True

    return False

def verify_mobile_number(user_id, mobile_number, key):
    try:
        mobile_number = MobileNumber.objects.get(user_id=user_id, mobile_number=mobile_number, activation_key=key)

        # FIXME: check if OTP has expired
        if not mobile_number.is_verified:
            mobile_number.is_verified = True
            mobile_number.save()
            _logger.debug("verified mobile_number %s successfully", mobile_number)

            return mobile_number
    except MobileNumber.DoesNotExist as e:
        raise ObjectNotFound from e

def generate_otp():
    return ''.join(random.choices(string.digits, k=4))  # FIXME: hardcoded OTP length

def save_mobile_number_for_user(user, mobile_number):
    if mobile_number_exists(mobile_number):
        raise AppLogicError("Mobile number already exists")

    num = MobileNumber()
    num.user = user
    num.mobile_number = mobile_number
    num.activation_key = generate_otp()
    num.key_expires = timezone.now() + datetime.timedelta(days=2)  # FIXME: hardcoded verification expiry
    num.is_verified = False
    num.save()
    return num

