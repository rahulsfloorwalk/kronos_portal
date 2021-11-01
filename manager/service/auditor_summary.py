from datetime import timedelta
from django.contrib.auth.models import Group
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_AUDITOR, Verification
from django.db.models import F, Count, Case, When, IntegerField
from django.db.models.functions import ExtractYear
from django.utils import timezone


def get_auditor_summary():
    month_list = ['01','02','03','04','05','06','07','08','09','10','11','12']
    auditor_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.all()
    count = auditor_list.aggregate(
        total_count = Count('id'),
        active_count = Count(Case(
            When(is_active = True, then=1),
            output_field=IntegerField(),
        )),
        last_week_reg=Count(Case(
            When(date_joined__gte = timezone.now() - timedelta(days=7), then = 1),
            output_field=IntegerField(),
        )),
        today_new_reg=Count(Case(
            When(date_joined = timezone.now(), then = 1),
            output_field=IntegerField(),
        )))

    gender_wise_data = auditor_list.select_related('profileinfo__gender').values('profileinfo__gender').annotate(count=Count('profileinfo__gender'))
    current_year = timezone.now().year
    age_wise_data = auditor_list.annotate(age=current_year - ExtractYear(F('profileinfo__date_of_birth'))).values('age').annotate(count=Count('age'))

    state_wise_data = ProfileInfo.objects.filter(city__state__isnull = False).select_related('city__state').values('city__state').annotate(count=Count('id')).order_by('-count')

    auditor_never_used = auditor_list.filter(is_active = True).exclude(id__in = AuditStore.objects.values_list('user', flat=True).distinct('user')).distinct('id').count()

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
