from audit.models import AuditCycle
from audit_store.models import AuditStore

from client.service.client_user import find_clientuser_by_user_id

def find_by_questionnaire_type_for_clientuser(questionnaire_type_id, user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditCycle.objects \
        .filter(
            client_id=user.clientuser.client_id,
            status__in=AuditCycle.TRENDABLE_STATUSES,
            questionnaire_type_id=questionnaire_type_id
        ) \
        .order_by('-end_date')

def find_all_for_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditStore.objects.presentable().visible_to(user).filter(
        audit__audit_cycle__client__id=user.clientuser.client_id,
    ).distinct('audit__audit_cycle_id').order_by('-audit__audit_cycle_id').values(
        'audit__audit_cycle__id',
        'audit__audit_cycle__name',
        'audit__audit_cycle__start_date',
        'audit__audit_cycle__end_date',
        'audit__audit_cycle__questionnaire_type__id',
        'audit__audit_cycle__questionnaire_type__name',
        'audit__audit_cycle__questionnaire_type__is_default',
    )
