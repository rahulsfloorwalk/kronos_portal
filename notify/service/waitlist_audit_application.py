import logging

from django.db.models import Count, F

from audit.models.audit_cycle import AuditCycle
from auditor.models import AuditApplication
from audit_store.models import AuditStore

from kronos.celery import app

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def waitlist_audit_application():
    """Change all application status in each store to waitlisted if audit store report count which are assigned >= no.of audits need to be conducted"""

    audit_with_same_count = AuditStore.objects.filter(audit__hidden = False, audit__audit_cycle__status = AuditCycle.ACTIVE, status__in = [AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED]).values('audit','audit__count',).annotate(cou = Count('id')).filter(audit__count__lte = F('cou')).values_list('audit', flat = True)

    applications = AuditApplication.objects.filter(audit__in = audit_with_same_count, status = AuditApplication.APPLIED).update(status = AuditApplication.WAITLISTED)

    _logger.info("Waitlist status changed of this %s audit Ids", str(list(audit_with_same_count)))
    _logger.info("Waitlist status changed for %s applications",applications)

    return applications
