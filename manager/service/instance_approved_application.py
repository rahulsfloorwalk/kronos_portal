from auditor.service import application_service
from django.db.transaction import atomic
from auditor.models import AuditApplication
from audit.models import Audit
from kronos.utils import today_ist
from django.db.models import F
from auditor.service import profile_info_service
from datetime import timedelta
from audit.models import AuditCycle
from django.core.exceptions import ObjectDoesNotExist
from notifications.models import Notification
from notifications.signals import notify
from notify.service import mail_notify
from notify import verbs


@atomic
def approved(application_id):
    today = today_ist()
    tomorrow = today + timedelta(days=1)
    audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').get(
        id=application_id,
        audit__hidden = False,
        # audit_date__exact=today_ist() + timedelta(days=1),
        audit_date__in=[today, tomorrow],
        report_exists=False,
        audit__audit_cycle__status=AuditCycle.ACTIVE)
    if audit_application.audit.valid_report_count() < audit_application.audit.count:
        distance = audit_application.distance()
        profile_percentage = audit_application.profile_match_percentage()
        certification_score = audit_application.certification_score()
        auditor_audit_count = audit_application.auditor_audit_count()
        # auditor_avg_rating=profile_info_service.get_avg_auditor_rating_by_user(audit_application.profileinfo.user)
        if distance is not None and certification_score is not None and auditor_audit_count is not None:
        # if distance is not None and certification_score is not None :
            if int(distance)<=10 and profile_percentage>=80 and certification_score>=80 and auditor_audit_count>=2:
            # if int(distance)<=10 and profile_percentage>=90 and certification_score>=80 :
                if audit_application.status == AuditApplication.APPLIED and audit_application.audit.valid_report_count() < audit_application.audit.count:
                    audit_count = 1
                    auto_approve = False
                    instant_approve = True
                    application = application_service.approve(audit_application.id, audit_application.audit_date, audit_application.audit.reimbursement, audit_application.audit.earnings_per_audit, audit_count, audit_application.profileinfo.user, auto_approve,instant_approve)
                    application.is_instant_approve=True
                    application.save()
                    # manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_INSTANT_APPROVED).order_by('-id')[0].id
                    # mail_notify.send_notification_mail(manager_notif_id, "")
                    return True
        else:
            return False
    return False

# def audit_cycle_audit_auto_approve_check_by_applictaion_id(application_id):
#     try:
#         audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').get(
#             id=application_id,
#             audit__hidden=False,
#             audit_date__exact=today_ist() + timedelta(days=1),
#             report_exists=False,
#             audit__audit_cycle__status=AuditCycle.ACTIVE
#         )
#         return audit_application.audit.audit_cycle.audit_auto_approve
#     except ObjectDoesNotExist:
#         return None
    
def audit_cycle_audit_auto_approve_check_by_applictaion_id(application_id):
    try:
        today = today_ist()
        tomorrow = today + timedelta(days=1)
        # audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').filter(
        audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').get(
            id=application_id,
            audit__hidden=False,
            # audit_date__exact=today_ist() + timedelta(days=1),
            audit_date__in=[today, tomorrow],
            report_exists=False,
            audit__audit_cycle__status=AuditCycle.ACTIVE
        )   
        # ).first()
        if audit_application:
            return audit_application.audit.audit_cycle.audit_auto_approve
        else:
            return None
    except ObjectDoesNotExist:
        return None
    
        