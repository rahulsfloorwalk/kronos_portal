from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError,ObjectNotFound
from django.db.transaction import atomic
from client.models import MPClientProfileInfo,Client

@atomic
def change_password(user_id, old_password, new_password):
    user = User.objects.get(pk=user_id)
    if not user.check_password(old_password):
        raise AppLogicError("Old password is incorrect")
    user.set_password(new_password)
    user.save()
    return {'detail': 'Password changed'}


def find_client_profile_info_by_id(user_id):
    try:
        return MPClientProfileInfo.objects.get(user_id=user_id)
    except MPClientProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def find_client_by_email(email):
    try:
        return Client.objects.get(name=email)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e
    

def get_client_dashboard_data(user_id):
    client_profile = find_client_profile_info_by_id(user_id)
    client= find_client_by_email(client_profile.user.email)
    result={
        'client_profile_info' :
            {
                'id': client_profile.id,
                'client_id':client.id,
                'first_name': client_profile.first_name,
                'mobile_number': client_profile.mobile_number,
                'email': client_profile.user.email,
                'company_name': client_profile.company_name,
                'user_id': user_id
            }
    }
    
    return result