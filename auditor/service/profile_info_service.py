from django.forms import ValidationError
from django.db import IntegrityError
from django.utils import timezone
import re
from django.db.transaction import atomic

from kronos.exceptions import AppLogicError, ObjectNotFound

from ..validators import numericValidator, minLengthValidator, maxLengthValidator
from ..models import ProfileInfo, MobileNumberHistoryLog
from registration.models import GROUP_NAME_AUDITOR

mobile_number_regex = "^[6-9]\d{9}$"
mobile_number_pattern = re.compile(mobile_number_regex)

def find_profile_info_by_user_id(user_id):
    try:
        return ProfileInfo.objects.get(user_id=user_id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e


def find_profile_info_by_id(profile_info_id):
    try:
        return ProfileInfo.objects.get(pk=profile_info_id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e


def save_old_mobile_number(profile_info, old_mobile_number):
    """Saving Old Mobile Number in MobileNumberHistoryLog Table"""
    mobile_history_log_obj = MobileNumberHistoryLog()
    mobile_history_log_obj.user = profile_info.user
    mobile_history_log_obj.mobile_number = old_mobile_number
    mobile_history_log_obj.created_at = timezone.now()
    mobile_history_log_obj.save()


def set_mobile_number(profile_info, mobile_number):
    """Performs basic validation and unique checks and sets the mobile_number if satisfied"""
    try:
        minLengthValidator(mobile_number)
        maxLengthValidator(mobile_number)
        numericValidator(mobile_number)
        if mobile_number_pattern.match(mobile_number):
            profile_info.mobile_number = mobile_number
            profile_info.save()
            return profile_info.user
        else:
            raise AppLogicError("invalid mobile number")
    except ValidationError as e:
        raise AppLogicError("invalid mobile number") from e
    except IntegrityError as e:
        raise AppLogicError("an account with this mobile number already exists") from e


def set_mobile_number_for_manager(user_id, mobile_number):
    profile_info = find_profile_info_by_user_id(user_id)
    old_mobile_number = profile_info.mobile_number
    set_mobile_number(profile_info, mobile_number)

    """Saving Old Mobile Number in MobileNumberHistoryLog Table"""
    save_old_mobile_number(profile_info, old_mobile_number)
    """End of Saving Old Mobile Number in MobileNumberHistoryLog Table"""

    return profile_info.user


def set_mobile_number_for_auditor(user_id, mobile_number):
    """Old Code for change mobile number if null in database"""
    """profile_info = find_profile_info_by_user_id(user_id)
    if not profile_info.mobile_number:
        user = set_mobile_number(profile_info, mobile_number)
        return user.profileinfo
    else:
        return profile_info"""
    """Old Code for change mobile number if null in database"""

    profile_info = find_profile_info_by_user_id(user_id)
    old_mobile_number = profile_info.mobile_number
    set_mobile_number(profile_info, mobile_number)

    """Saving Old Mobile Number in MobileNumberHistoryLog Table"""
    save_old_mobile_number(profile_info, old_mobile_number)
    """End of Saving Old Mobile Number in MobileNumberHistoryLog Table"""

    return profile_info


def count_profileinfo_in_city(city_id):
    return ProfileInfo.objects.filter(city_id=city_id, user__is_active=True).count()


def find_profileinfo_by_city(city_id):
    return ProfileInfo.objects.filter(city_id=city_id, user__is_active=True)


@atomic
def save_auditor_rating(user, rating):
    profile_info = ProfileInfo.objects.get(user=user)
    profile_info.auditor_rating = rating
    profile_info.save()


def get_auditor_rating_by_user(user):
    group = user.groups.all()[0]
    if group.name == GROUP_NAME_AUDITOR:
        profile_info = ProfileInfo.objects.get(user=user)
        return profile_info.auditor_rating is not None
    else:
        return True
