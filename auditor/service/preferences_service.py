from ..models import Preferences

def find_preferences_by_user_id(user_id):
    try:
        return Preferences.objects.get(user_id=user_id)
    except Preferences.DoesNotExist as e:
        return Preferences()

def save(preferences):
    preferences.save()
    return preferences

