import logging

from django.db.models import Count, F

from audit.models.audit import Audit
from audit.models.audit_cycle import AuditCycle
from audit_store.models import AuditStore

from kronos.celery import app

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def hide_audit_store_section():
    """Hide audit store section when audit store report count (with completed status) >= audit count"""

    audit_list = AuditStore.objects.filter(audit__hidden = False, audit__audit_cycle__status = AuditCycle.ACTIVE, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED]).values('audit','audit__count',).annotate(cou = Count('id')).filter(audit__count__lte = F('cou')).values_list('audit', flat=True)
    audit_list = set(audit_list)
    audit_with_same_count = Audit.objects.filter(id__in = audit_list).update(hidden = True)

    _logger.info("Today %s audits are found",audit_list)
    _logger.info("Today %s audit store section are hide",audit_with_same_count)

    return audit_with_same_count
