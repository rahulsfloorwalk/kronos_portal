from audit_store.models import AuditStore
from audit.models import AuditCycle, Audit, AuditCycleProofTagList
from questionnaire.models import QuestionnaireType
from client.models import Store

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
    """
        Normal client user can't access dashboard and report browser that's why need to
        remove visible_to(user) function
    """
    """
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
    """
    rows = AuditStore.objects \
        .presentable() \
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

def find_questionnaire_types_for_client_store_by_user(user, store_id):
    rows = AuditStore.objects \
        .presentable() \
        .visible_to(user) \
        .filter(
            audit__audit_cycle__client__id=user.clientuser.client_id,
            audit__store__id=store_id
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


def find_questionnaire_types_for_proof_comparison(store_id):
    audit_audit_cycle_list = Audit.objects \
        .filter(store_id=store_id).distinct('audit_cycle__id').values_list('audit_cycle__id', flat=True)
    client_id = Store.objects.get(id=store_id).client.id
    questionnaire_types = QuestionnaireType.objects.filter(client_id=client_id).order_by('id')
    qt_list = []
    for qt in questionnaire_types:
        audit_cycle_count = AuditCycleProofTagList.objects \
            .filter(audit_cycle__id__in=audit_audit_cycle_list,
                    audit_cycle__status__in=[AuditCycle.CLEARING, AuditCycle.ARCHIVED],
                    audit_cycle__questionnaire_type__id=qt.id, is_active=True) \
            .distinct('audit_cycle__id') \
            .count()
        if audit_cycle_count >= 1:
            qt_dict = {}
            qt_dict['id'] = qt.id
            qt_dict['name'] = qt.name
            qt_list.append(qt_dict)
    return qt_list
