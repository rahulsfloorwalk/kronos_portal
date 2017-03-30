from django.contrib.auth.models import User

from kronos.exceptions import AppLogicError, ObjectNotFound

from ..models import AuditCycle

def save(audit):
    AuditCycle.save(audit)
    return audit

def find_for_clientuser(user_id):
    try:
        user = User.objects.get(pk=user_id)
        return AuditCycle.objects.filter(client_id=user.clientuser.client_id, status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE)).order_by('-end_date')
    except (User.DoesNotExist, ) as e:
        raise ObjectNotFound from e

