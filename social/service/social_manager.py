from social.models import Facebook

def find_facebook_by_user(user_id):
    try:
        return Facebook.objects.get(user_id=user_id)
    except Facebook.DoesNotExist:
        return Facebook(user_id=user_id)