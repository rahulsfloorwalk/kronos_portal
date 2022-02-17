from django.contrib.auth.models import Group
from registration.models import GROUP_NAME_AUDITOR


def get_auditor_list_by_filter(filters: dict) -> list:
    query = {}
    if filters.get('city',None):
        query['profileinfo__city'] = filters.get('city','')

    if filters.get('gender',''):
        query['profileinfo__gender'] = filters.get('gender','')

    if filters.get('education',[]):
        query['profileinfo__education__in'] = filters.get('education',[])

    if filters.get('occupation',[]):
        query['additionalinfo__occupation__in'] = filters.get('occupation',[])

    if filters.get('income',''):
        query['additionalinfo__income'] = filters.get('income','')

    if filters.get('industry',[]):
        query['additionalinfo__industry__in'] = filters.get('industry',[])

    if filters.get('interest_area',[]):
        query['additionalinfo__interest_area__in'] = filters.get('interest_area',[])

    user_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.filter(**query).values_list('id', flat=True)
    return list(user_list)


def get_auditor_count_by_filter(filters: dict) -> int:
    user_list = get_auditor_list_by_filter(filters)
    return len(user_list)