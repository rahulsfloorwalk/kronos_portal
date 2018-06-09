from django.dispatch import receiver
from django.utils import timezone

from audit_store.models import AuditStore, ReportStatusLog
from audit_store.signals import *


@receiver(audit_store_status_change, dispatch_uid="report_log_receiver")
def status_change_report_log_callback(sender, **kwargs):
    user_actor = kwargs.get('user_actor')
    status = kwargs.get('status')
    id = kwargs.get('id')
    report_status_log = ReportStatusLog()
    report_status_log.user_actor = user_actor
    report_status_log.status = status
    report_status_log.audit_store_id = id
    report_status_log.created_at = timezone.now()
    report_status_log.save()
