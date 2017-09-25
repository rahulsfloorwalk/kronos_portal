from django.db.transaction import atomic

from social.models import Facebook

from auditor.service import profile_info_service
from auditor.models import ProfileInfo

@atomic
def save(facebook):
    facebook.save()
    profile = profile_info_service.find_profile_info_by_user_id(facebook.user_id)

    if not profile.first_name and facebook.profile_data.get("first_name"):
        profile.first_name = facebook.profile_data["first_name"]

    if not profile.last_name and facebook.profile_data.get("last_name"):
        profile.last_name = facebook.profile_data["last_name"]

    if not profile.gender and facebook.profile_data.get("gender"):
        if facebook.profile_data["gender"] == "male":
            profile.gender = ProfileInfo.MALE
        elif facebook.profile_data["gender"] == "female":
            profile.gender = ProfileInfo.FEMALE

    profile.save()
    return facebook

def find_facebook_by_user(user_id):
    try:
        return Facebook.objects.get(user_id=user_id)
    except Facebook.DoesNotExist:
        return Facebook()
