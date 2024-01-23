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

@atomic
def approved(application_id):
    audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').get(
        id=application_id,
        audit__hidden = False,
        audit_date__exact=today_ist() + timedelta(days=1),
        report_exists=False,
        audit__audit_cycle__status=AuditCycle.ACTIVE)
    if audit_application.audit.valid_report_count() < audit_application.audit.count:
        distance = audit_application.distance()
        profile_percentage = audit_application.profile_match_percentage()
        certification_score = audit_application.certification_score()
        # auditor_avg_rating=profile_info_service.get_avg_auditor_rating_by_user(audit_application.profileinfo.user)
        if distance is not None and certification_score is not None:
            if int(distance)<=10 and profile_percentage>=90 and certification_score>=80:
                if audit_application.status == AuditApplication.APPLIED and audit_application.audit.valid_report_count() < audit_application.audit.count:
                    audit_count = 1
                    auto_approve = False
                    instant_approve = True
                    application = application_service.approve(audit_application.id, audit_application.audit_date, audit_application.audit.reimbursement, audit_application.audit.earnings_per_audit, audit_count, audit_application.profileinfo.user, auto_approve,instant_approve)
                    application.is_instant_approve=True
                    application.save()
                    return True
        else:
            return False
    return False

def audit_cycle_audit_auto_approve_check_by_applictaion_id(application_id):
    try:
        audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').get(
            id=application_id,
            audit__hidden=False,
            audit_date__exact=today_ist() + timedelta(days=1),
            report_exists=False,
            audit__audit_cycle__status=AuditCycle.ACTIVE
        )
        return audit_application.audit.audit_cycle.audit_auto_approve
    except ObjectDoesNotExist:
        return None
    
        