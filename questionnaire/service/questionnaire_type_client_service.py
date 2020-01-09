from audit_store.models import AuditStore
# from audit.models import AuditCycle

def find_questionnaire_types_for_client_by_user(user):
    rows = AuditStore.objects \
        .presentable() \
        .visible_to(user) \
        .filter(
            audit__audit_cycle__client__id=user.clientuser.client_id,
        ) \
        .distinct('audit__audit_cycle__questionnaire_type_id') \
        .order_by('audit__audit_cycle__questionnaire_type__id') \
        .values(
            'audit__audit_cycle__questionnaire_type__id',
            'audit__audit_cycle__questionnaire_type__name',
            'audit__audit_cycle__questionnaire_type__is_default',
            'audit__audit_cycle__questionnaire_type__client_id',
        )

    def map_questionnaire_type_values(values):
        return {
            "id": values["audit__audit_cycle__questionnaire_type__id"],
            "name": values["audit__audit_cycle__questionnaire_type__name"],
            "is_default": values["audit__audit_cycle__questionnaire_type__is_default"],
            "client_id": values["audit__audit_cycle__questionnaire_type__client_id"],
        }

    return [q for q in map(map_questionnaire_type_values, rows) if q["id"]]

def find_questionnaire_types_for_client_dashboard_by_user(user):
    rows = AuditStore.objects \
        .presentable() \
        .visible_to(user) \
        .filter(
            audit__audit_cycle__client__id=user.clientuser.client_id,
            # audit__audit_cycle__status__in=AuditCycle.TRENDABLE_STATUSES
        ) \
        .distinct('audit__audit_cycle__questionnaire_type_id') \
        .order_by('audit__audit_cycle__questionnaire_type__id') \
        .values(
            'audit__audit_cycle__questionnaire_type__id',
            'audit__audit_cycle__questionnaire_type__name',
            'audit__audit_cycle__questionnaire_type__is_default',
            'audit__audit_cycle__questionnaire_type__client_id',
        )

    def map_questionnaire_type_values(values):
        return {
            "id": values["audit__audit_cycle__questionnaire_type__id"],
            "name": values["audit__audit_cycle__questionnaire_type__name"],
            "is_default": values["audit__audit_cycle__questionnaire_type__is_default"],
            "client_id": values["audit__audit_cycle__questionnaire_type__client_id"],
        }

    return [q for q in map(map_questionnaire_type_values, rows) if q["id"]]