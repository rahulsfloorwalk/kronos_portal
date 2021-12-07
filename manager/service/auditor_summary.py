from datetime import timedelta
from django.contrib.auth.models import Group
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
from audit.models.audit_cycle import AuditCycle
from registration.models import GROUP_NAME_AUDITOR, Verification
from django.db.models import F, Count, Case, When, IntegerField
from django.db.models.functions import ExtractYear
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from manager.service.applications import find_unique_applications_by_cycle


def get_auditor_summary():
    now = timezone.now()
    month_list = ['01','02','03','04','05','06','07','08','09','10','11','12']
    auditor_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.all()
    count = auditor_list.aggregate(
        total_count = Count('id'),
        active_count = Count(Case(
            When(last_login__gte = now - relativedelta(months=+6), then=1),
            output_field=IntegerField(),
        )),
        last_week_reg=Count(Case(
            When(date_joined__gte = now - timedelta(days=7), then = 1),
            output_field=IntegerField(),
        )),
        today_new_reg=Count(Case(
            When(date_joined__date = now.date(), then = 1),
            output_field=IntegerField(),
        )))

    gender_wise_data = auditor_list.select_related('profileinfo__gender').values('profileinfo__gender').annotate(count=Count('profileinfo__gender'))
    current_year = now.year
    age_wise_data = auditor_list.annotate(age=current_year - ExtractYear(F('profileinfo__date_of_birth'))).values('age').annotate(count=Count('age'))

    state_wise_data = ProfileInfo.objects.filter(city__state__isnull = False).select_related('city__state').values('city__state').annotate(count=Count('id')).order_by('-count')

    auditor_never_used = auditor_list.filter(last_login__gte = now - relativedelta(months=+6)).exclude(id__in = AuditStore.objects.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED]).values_list('user', flat=True).distinct('user')).distinct('id').count()

    month_count_list = []
    verification_list = Verification.objects.filter(key_expires__year = current_year, is_verified = True, user__groups__name = GROUP_NAME_AUDITOR)
    for month in month_list:
        new_reg = auditor_list.filter(date_joined__month = month, date_joined__year = current_year).count()
        verified_count = verification_list.filter(key_expires__month = month).values_list('user', flat=True).distinct('user').count()
        month_count_list.append({
            'month': month,
            'year': current_year,
            'new_reg': new_reg,
            'verified_count': verified_count
        })
    data = {
        'total_count': count['total_count'],
        'active_count': count['active_count'],
        'last_week_reg': count['last_week_reg'],
        'today_new_reg': count['today_new_reg'],
        'auditor_never_used': auditor_never_used,
        'gender_data': [{'gender':i['profileinfo__gender'], 'count': i['count']} for i in gender_wise_data],
        'state_data': [{'state':i['city__state'], 'count': i['count']} for i in state_wise_data],
        'age_data': [i for i in age_wise_data],
        'monthly_auditors': month_count_list
    }
    return data


def get_project_analytics_cycle_wise(month, year, manager, cycle, client):
    result = []
    now = timezone.now()
    now = now.date()
    if month:
        month_list = [month]
    else:
        month_list = ['01','02','03','04','05','06','07','08','09','10','11','12']
    audit_cycle = AuditCycle.objects.select_related('client').prefetch_related('audits').filter(start_date__month__in=month_list, start_date__year=year).order_by('-end_date')
    if cycle:
        audit_cycle = audit_cycle.filter(id = cycle)
    if client:
        audit_cycle = audit_cycle.filter(client__id = client)
    if manager:
        audit_cycle = audit_cycle.filter(client__managers__user__id = manager)

    audit_stores = AuditStore.objects.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED])
    auditor_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.filter(is_active = True)
    for cycle in audit_cycle:
        filtered_audit_stores = audit_stores.filter(audit__audit_cycle = cycle)
        unique_auditors = filtered_audit_stores.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED]).values('user').distinct('user').count()
        application = find_unique_applications_by_cycle(cycle.id)

        audit_store_auditor_list = filtered_audit_stores.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED]).values_list('user', flat=True).distinct('user')
        auditor_obj_list = auditor_list.filter(id__in = audit_store_auditor_list).values_list('id', flat=True)
        new_auditor_count = 0
        for user in auditor_obj_list:
            recent_audit_exists = audit_stores.filter(audit_date__lt = cycle.start_date, user = user).exists()
            new_auditor_count += 0 if recent_audit_exists else 1
        result.append({
            'client': cycle.client.name,
            'cycle': cycle.name,
            'month': cycle.start_date.month,
            'year': year,
            'application_count': application,
            'total_audits': cycle.planned_audit,
            'unique_auditors': unique_auditors,
            'new_auditor': new_auditor_count,
        })
    return result


def get_project_analytics_month_wise(year):
    result = []
    audit_cycle = AuditCycle.objects.select_related('client').prefetch_related('audits').filter(start_date__year=year).order_by('-end_date')

    audit_stores = AuditStore.objects.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED])
    auditor_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.filter(is_active = True)
    month_list = ['01','02','03','04','05','06','07','08','09','10','11','12']
    for month in month_list:
        filtered_audit_cycle = audit_cycle.filter(start_date__month = month)

        application = 0
        planned_audits = 0
        unique_auditors = 0
        total_new_auditor = 0
        for cycle in filtered_audit_cycle:
            application += find_unique_applications_by_cycle(cycle.id)
            planned_audits += cycle.planned_audit

            filtered_audit_stores = audit_stores.filter(audit__audit_cycle = cycle)
            unique_auditors += filtered_audit_stores.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED]).values('user').distinct('user').count()

            audit_store_auditor_list = filtered_audit_stores.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED]).values_list('user', flat=True).distinct('user')
            auditor_obj_list = auditor_list.filter(id__in = audit_store_auditor_list).values_list('id', flat=True)
            new_auditor_count = 0
            for user in auditor_obj_list:
                recent_audit_exists = audit_stores.filter(status__in = [AuditStore.ACCEPTED, AuditStore.COMPLETED], audit_date__lt = cycle.start_date, user = user).exists()
                new_auditor_count += 0 if recent_audit_exists else 1

            total_new_auditor += new_auditor_count
        result.append({
            'month': month,
            'year': year,
            'application_count': application,
            'total_audits': planned_audits,
            'unique_auditors': unique_auditors,
            'new_auditor_count': total_new_auditor,
        })
    return result