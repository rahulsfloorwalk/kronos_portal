from audit.models import AuditCycle

from client.service.client_user import find_clientuser_by_user_id

def find_by_questionnaire_type_for_clientuser(questionnaire_type_id, user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditCycle.objects \
        .filter(
            client_id=user.clientuser.client_id,
            status__in=(AuditCycle.REPORT,AuditCycle.ACTIVE, AuditCycle.ARCHIVED),
            questionnaire_type_id=questionnaire_type_id
        ) \
        .order_by('-end_date')

