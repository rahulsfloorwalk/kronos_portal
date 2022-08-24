import decimal
from django.contrib.auth.models import Group
from django.db.models import Avg
from auditor.models import AuditorRating
from registration.models import GROUP_NAME_AUDITOR


def get_auditor_list_by_filter(filters: dict) -> list:
    query = {
        'is_active': True,
    }
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

    auditor_ratings = AuditorRating.RATING + ((None, ''),)
    if filters.get('auditor_rating', []):
        filtered_auditor_ratings = filters.get('auditor_rating', [])
    else:
        filtered_auditor_ratings = [x[0] for x in auditor_ratings]

    def float_range(start, stop, step):
        start = decimal.Decimal(start)
        stop = decimal.Decimal(stop)
        while start < stop:
            yield float(start)
            start += decimal.Decimal(step)

    user_list = Group.objects.get(name=GROUP_NAME_AUDITOR).user_set.filter(**query).annotate(avg_rating = Avg('auditorrating__rating')).values_list('id', 'avg_rating')

    # Sort user list based on auditor rating
    ordered_user_list = []
    filtered_auditor_ratings = [x[0] for x in auditor_ratings if x[0] in filtered_auditor_ratings]
    for val in filtered_auditor_ratings:
        filtered_ids = []
        if val:
            val_range = list(float_range(val + 0.0, val + 0.9, '0.1'))
            for x in user_list:
                if x[1] and round(x[1], 1) in val_range:
                    filtered_ids.append(x[0])
        else:
            for x in user_list:
                if x[1] is None:
                    filtered_ids.append(x[0])
        if filtered_ids:
            ordered_user_list.extend(filtered_ids)

    return ordered_user_list


def get_auditor_count_by_filter(filters: dict) -> int:
    user_list = get_auditor_list_by_filter(filters)
    return len(user_list)