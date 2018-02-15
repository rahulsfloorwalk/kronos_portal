from ..models import Preferences
from registration.service import auditor

def find_preferences_by_user_id(user_id):
    user = auditor.find_auditor_by_id(user_id)
    try:
        return Preferences.objects.get(user=user)
    except Preferences.DoesNotExist as e:
        return Preferences(user=user)

def save(preferences):
    preferences.save()
    return preferences

def set_preferences(user_id, prefs_dict):
    prefs = find_preferences_by_user_id(user_id)

    if "receive_new_opportunities_email" in prefs_dict:
        prefs.receive_new_opportunities_email = bool(prefs_dict["receive_new_opportunities_email"])
    if "receive_new_opportunities_sms" in prefs_dict:
        prefs.receive_new_opportunities_sms = bool(prefs_dict["receive_new_opportunities_sms"])

    prefs.save()
    return prefs
