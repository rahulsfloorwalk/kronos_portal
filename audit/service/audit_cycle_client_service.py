from kronos.exceptions import ObjectNotFound

from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.models import Question

from client.service.client_user import find_clientuser_by_user_id, find_non_client_admin_user_store_by_client_user_id


def find_by_questionnaire_type_for_clientuser(questionnaire_type_id, user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditCycle.objects \
        .filter(
            client_id=user.clientuser.client_id,
            status__in=AuditCycle.TRENDABLE_STATUSES,
            questionnaire_type_id=questionnaire_type_id
        ) \
        .order_by('-end_date')


def find_audit_cycle_by_id_for_clientuser(audit_cycle_id, user_id):
    user = find_clientuser_by_user_id(user_id)
    try:
        return AuditCycle.objects.get(pk=audit_cycle_id, client=user.clientuser.client)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


def find_all_for_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    rows = AuditStore.objects \
        .presentable() \
        .visible_to(user) \
        .filter(
            audit__audit_cycle__client__id=user.clientuser.client_id,
            answers__question__visibility=Question.VISIBLE_TO_ALL,
            answers__question__hide_question=False,
        ) \
        .distinct('audit__audit_cycle_id') \
        .order_by('-audit__audit_cycle_id') \
        .values(
            'audit__audit_cycle__id',
            'audit__audit_cycle__name',
            'audit__audit_cycle__status',
            'audit__audit_cycle__start_date',
            'audit__audit_cycle__end_date',
            'audit__audit_cycle__questionnaire_type__id',
            'audit__audit_cycle__questionnaire_type__name',
            'audit__audit_cycle__questionnaire_type__is_default',
        )

    def map_audit_cycle_values(values):
        return {
            "id": values["audit__audit_cycle__id"],
            "name": values["audit__audit_cycle__name"],
            "status": values["audit__audit_cycle__status"],
            "start_date": values["audit__audit_cycle__start_date"],
            "end_date": values["audit__audit_cycle__end_date"],
            "questionnaire_type": {
                "id": values["audit__audit_cycle__questionnaire_type__id"],
                "name": values["audit__audit_cycle__questionnaire_type__name"],
                "is_default": values["audit__audit_cycle__questionnaire_type__is_default"],
            },
        }

    return map(map_audit_cycle_values, rows)

def find_all_for_dashboard_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
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
        .distinct('audit__audit_cycle_id') \
        .order_by('-audit__audit_cycle_id') \
        .values(
            'audit__audit_cycle__id',
            'audit__audit_cycle__name',
            'audit__audit_cycle__status',
            'audit__audit_cycle__start_date',
            'audit__audit_cycle__end_date',
            'audit__audit_cycle__questionnaire_type__id',
            'audit__audit_cycle__questionnaire_type__name',
            'audit__audit_cycle__questionnaire_type__is_default',
        )
    """
    if client_user.is_client_admin():
        rows = AuditStore.objects \
            .presentable() \
            .filter(
                audit__audit_cycle__client__id=user.clientuser.client_id,
                answers__question__visibility=Question.VISIBLE_TO_ALL,
                answers__question__hide_question=False,
                # audit__audit_cycle__status__in=AuditCycle.TRENDABLE_STATUSES
            ) \
            .distinct('audit__audit_cycle_id') \
            .order_by('-audit__audit_cycle_id') \
            .values(
                'audit__audit_cycle__id',
                'audit__audit_cycle__name',
                'audit__audit_cycle__status',
                'audit__audit_cycle__start_date',
                'audit__audit_cycle__end_date',
                'audit__audit_cycle__questionnaire_type__id',
                'audit__audit_cycle__questionnaire_type__name',
                'audit__audit_cycle__questionnaire_type__is_default',
            )
    else:
        non_client_admin_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_client_admin_store_list = non_client_admin_store.get_store_list()
        rows = AuditStore.objects \
            .presentable() \
            .filter(
                audit__audit_cycle__client__id=user.clientuser.client_id,
                audit__store__id__in=non_client_admin_store_list,
                answers__question__visibility=Question.VISIBLE_TO_ALL,
                answers__question__hide_question=False,
            ) \
            .distinct('audit__audit_cycle_id') \
            .order_by('-audit__audit_cycle_id') \
            .values(
                'audit__audit_cycle__id',
                'audit__audit_cycle__name',
                'audit__audit_cycle__status',
                'audit__audit_cycle__start_date',
                'audit__audit_cycle__end_date',
                'audit__audit_cycle__questionnaire_type__id',
                'audit__audit_cycle__questionnaire_type__name',
                'audit__audit_cycle__questionnaire_type__is_default',
            )

    def map_audit_cycle_values(values):
        return {
            "id": values["audit__audit_cycle__id"],
            "name": values["audit__audit_cycle__name"],
            "status": values["audit__audit_cycle__status"],
            "start_date": values["audit__audit_cycle__start_date"],
            "end_date": values["audit__audit_cycle__end_date"],
            "questionnaire_type": {
                "id": values["audit__audit_cycle__questionnaire_type__id"],
                "name": values["audit__audit_cycle__questionnaire_type__name"],
                "is_default": values["audit__audit_cycle__questionnaire_type__is_default"],
            },
        }

    return map(map_audit_cycle_values, rows)

def find_all_for_nps_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
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
        .distinct('audit__audit_cycle_id') \
        .order_by('-audit__audit_cycle_id') \
        .values(
            'audit__audit_cycle__id',
            'audit__audit_cycle__name',
            'audit__audit_cycle__status',
            'audit__audit_cycle__start_date',
            'audit__audit_cycle__end_date',
            'audit__audit_cycle__questionnaire_type__id',
            'audit__audit_cycle__questionnaire_type__name',
            'audit__audit_cycle__questionnaire_type__is_default',
        )
    """
    if client_user.is_client_admin():
        rows = AuditStore.objects \
            .presentable() \
            .filter(
                audit__audit_cycle__client__id=user.clientuser.client_id,
                audit__audit_cycle__sections__questions__visibility=Question.VISIBLE_TO_ALL,
                audit__audit_cycle__sections__questions__hide_question=False,
                # audit__audit_cycle__status__in=AuditCycle.TRENDABLE_STATUSES
            ) \
            .distinct('audit__audit_cycle_id') \
            .order_by('-audit__audit_cycle_id') \
            .values(
                'audit__audit_cycle__id',
                'audit__audit_cycle__name',
                'audit__audit_cycle__status',
                'audit__audit_cycle__start_date',
                'audit__audit_cycle__end_date',
                'audit__audit_cycle__questionnaire_type__id',
                'audit__audit_cycle__questionnaire_type__name',
                'audit__audit_cycle__questionnaire_type__is_default',
            )
    else:
        non_client_admin_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_client_admin_store_list = non_client_admin_store.get_store_list()
        rows = AuditStore.objects \
            .presentable() \
            .filter(
                audit__audit_cycle__client__id=user.clientuser.client_id,
                audit__store__id__in=non_client_admin_store_list,
                audit__audit_cycle__sections__questions__visibility=Question.VISIBLE_TO_ALL,
                audit__audit_cycle__sections__questions__hide_question=False,
            ) \
            .distinct('audit__audit_cycle_id') \
            .order_by('-audit__audit_cycle_id') \
            .values(
                'audit__audit_cycle__id',
                'audit__audit_cycle__name',
                'audit__audit_cycle__status',
                'audit__audit_cycle__start_date',
                'audit__audit_cycle__end_date',
                'audit__audit_cycle__questionnaire_type__id',
                'audit__audit_cycle__questionnaire_type__name',
                'audit__audit_cycle__questionnaire_type__is_default',
            )
    # audit_cycles_with_null_nps_section = AuditStore.objects \
    #     .filter(nps_section__isnull=True) \
    #     .values('audit__audit_cycle__id') \
    #     .distinct('audit__audit_cycle__id')

    audit_cycles_with_null_nps_section = AuditStore.objects \
        .filter(audit__audit_cycle__client_id=user.clientuser.client_id,nps_section__isnull=True,) \
        .values_list('audit__audit_cycle__id', flat=True) \
        .distinct()
    
    invalid_audit_cycle_ids = [
        audit_cycle['audit__audit_cycle__id']
        for audit_cycle in audit_cycles_with_null_nps_section
    ]

    # Filter out rows containing those AuditCycle IDs
    rows = [row for row in rows if row['audit__audit_cycle__id'] not in invalid_audit_cycle_ids]

    def map_audit_cycle_values(values):
        return {
            "id": values["audit__audit_cycle__id"],
            "name": values["audit__audit_cycle__name"],
            "status": values["audit__audit_cycle__status"],
            "start_date": values["audit__audit_cycle__start_date"],
            "end_date": values["audit__audit_cycle__end_date"],
            "questionnaire_type": {
                "id": values["audit__audit_cycle__questionnaire_type__id"],
                "name": values["audit__audit_cycle__questionnaire_type__name"],
                "is_default": values["audit__audit_cycle__questionnaire_type__is_default"],
            },
        }

    return map(map_audit_cycle_values, rows)

def get_audit_cycle_year_list(user_id):
    user = find_clientuser_by_user_id(user_id)
    client_user = user.clientuser
    if client_user.is_client_admin():
        result = AuditCycle.objects \
            .filter(client=user.clientuser.client, status__in=[AuditCycle.ARCHIVED, AuditCycle.CLEARING]).exists()
        if result:
            first_entry = AuditCycle.objects \
                .filter(client=user.clientuser.client, status__in=[AuditCycle.ARCHIVED, AuditCycle.CLEARING]) \
                .order_by('start_date').first()
            last_entry = AuditCycle.objects \
                .filter(client=user.clientuser.client, status__in=[AuditCycle.ARCHIVED, AuditCycle.CLEARING]) \
                .order_by('start_date').last()
            year_list = []
            for i in range(first_entry.start_date.year, last_entry.start_date.year + 1):
                year_list.append(i)
            audit_cycle_data = {'audit_cycle_status': True, 'audit_cycle_year_list': year_list}
        else:
            audit_cycle_data = {'audit_cycle_status': False, 'audit_cycle_year_list': []}
    else:
        audit_cycle_data = {'audit_cycle_status': False, 'audit_cycle_year_list': []}
    return audit_cycle_data


def get_audit_cycle_score(questionnaire_type_id, user_id):
    user = find_clientuser_by_user_id(user_id)
    rows = AuditStore.objects \
        .presentable() \
        .filter(
            audit__audit_cycle__questionnaire_type_id=questionnaire_type_id,
            audit__audit_cycle__client__id=user.clientuser.client_id,
            answers__question__visibility=Question.VISIBLE_TO_ALL,
            answers__question__hide_question=False,
        ) \
        .distinct('audit__audit_cycle_id') \
        .order_by('-audit__audit_cycle_id') \
        .prefetch_related('audit__audit_cycle_id')\
        .values_list(
            'audit__audit_cycle__id',
            flat=True
        )

    if len(rows) is 0:
        return []

    # if len(rows) > 4:
    #     rows = rows[:4]

    audit_cycle_list = AuditCycle.objects.filter(id__in=rows).order_by('-id')
    return audit_cycle_list


def find_all_active_audit_cycle():
    return AuditCycle.objects.filter(status=AuditCycle.ACTIVE)


def find_all_client_with_active_report_and_clearing_audit_cycle_status():
    return AuditCycle.objects \
        .filter(status__in=[AuditCycle.ACTIVE, AuditCycle.REPORT, AuditCycle.CLEARING],
                client__receive_email_notification=True) \
        .distinct('client_id') \
        .values_list('client_id', flat=True)
