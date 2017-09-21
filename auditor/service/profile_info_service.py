from django.forms import ValidationError
from django.db import IntegrityError

from kronos.exceptions import AppLogicError, ObjectNotFound

from ..validators import numericValidator, minLengthValidator, maxLengthValidator
from ..models import ProfileInfo

def find_profile_info_by_user_id(user_id):
    try:
        profile_info = ProfileInfo.objects.get(user_id=user_id)
        return profile_info
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def set_mobile_number_for_auditor(user_id, mobile_number):
    try:
        minLengthValidator(mobile_number)
        maxLengthValidator(mobile_number)
        numericValidator(mobile_number)

        profile_info = find_profile_info_by_user_id(user_id)
        profile_info.mobile_number = mobile_number
        profile_info.save()
        return profile_info.user
    except ValidationError as e:
        raise AppLogicError("invalid mobile number") from e
    except IntegrityError as e:
        raise AppLogicError("mobile number already exists in system") from e


