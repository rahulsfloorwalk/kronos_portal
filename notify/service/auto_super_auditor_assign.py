import logging
from django.db.transaction import atomic
from django.db.models import Count, Avg
from auditor.models import ProfileInfo,AuditorRating
from django.contrib.auth.models import User
from registration.models import GROUP_NAME_AUDITOR
from kronos.celery import app
from celery.result import ResultSet
from auditor.service import stats
from audit_store.models import AuditStore
_logger = logging.getLogger(__name__)

def fail_percentage(pas,fail):
    if fail==0:
        return True
    elif int((fail/pas)*100)<=30: #20
        return True
    else:
        return False

@app.task(iqnore_result=True)
def auto_approve_for_super_auditor():
    user=User.objects.filter(groups__name=GROUP_NAME_AUDITOR)
    top_rating_user_id=[]
    for i in user:
        rating = AuditorRating.objects.filter(user=i).aggregate(avg=Avg('rating'))
        if rating:
            if rating['avg'] is not None and int(rating['avg'])>=4:  #4
                top_rating_user_id.append(i.id)
            else:
                pass
    percentage_user_id=[]
    for i in top_rating_user_id:
        percentage=stats.get_profile_percentage(i)
        if percentage>=90: #90
            percentage_user_id.append(i)
        else:
            pass
    accpet_report_user_id=[]
    for i in percentage_user_id:
        accept_report=AuditStore.objects.filter(user_id=i,status='ACCEPTED')
        fail_report=AuditStore.objects.filter(user_id=i,status='FAILED')
        if accept_report.count()>=5 and fail_percentage(accept_report.count(),fail_report.count()):  #5
            accpet_report_user_id.append(i)
        else:
            pass
    obj=ProfileInfo.objects.filter(user_id__in=accpet_report_user_id)
    obj.update(is_super_auditor=True)
    _logger.info("auto assign super auditor")
    return True
    




