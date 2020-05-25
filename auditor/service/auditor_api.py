from django.contrib.auth.models import User
from kronos.exceptions import AppLogicError
from django.db.transaction import atomic
from auditor.service import profile_info_service
from auditor.service import stats
@atomic
def change_password(user_id, old_password, new_password):
    user = User.objects.get(pk=user_id)
    if not user.check_password(old_password):
        raise AppLogicError("Old password is incorrect")
    user.set_password(new_password)
    user.save()
    return {'detail': 'Password changed'}


def get_auditor_dashboard_data(user_id):
    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
    auditor_stats = stats.getAuditorStats(user_id)
    result = {
        'auditor_info':
            {
                'first_name': profile_info.first_name,
                'last_name': profile_info.last_name,
                'mobile_number': profile_info.mobile_number,
                'city': profile_info.city.name if profile_info.city else "",
                'email': profile_info.user.email
            },
        'auditor_stats': auditor_stats
    }
    return result
