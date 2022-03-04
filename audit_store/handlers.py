from django.dispatch import receiver
from django.utils import timezone

from audit_store.models import ReportStatusLog
from audit_store.signals import audit_store_status_change


@receiver(audit_store_status_change, dispatch_uid="status_change_report_log_callback")
def status_change_report_log_callback(sender, **kwargs):
    user_actor = kwargs['user_actor']
    status = kwargs['status']
    audit_store = kwargs['audit_store']
    message = kwargs['message'] if 'message' in kwargs else ''
    proof_tags = kwargs['proof_tags'] if 'proof_tags' in kwargs else ''
    report_status_log = ReportStatusLog()
    report_status_log.user_actor = user_actor
    report_status_log.status = status
    report_status_log.message = message
    if proof_tags:
        report_status_log.report_data = {
            'proof_tags': proof_tags
        }
    report_status_log.audit_store = audit_store
    report_status_log.created_at = timezone.now()
    report_status_log.save()
