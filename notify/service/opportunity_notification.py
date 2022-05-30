from notify.service.mail_opportunity import schedule_opportunity_emails_for_audit_cycle_with_filters
from notify.service.whatsapp_opportunity import schedule_opportunity_whatsapp_for_audit_cycle_with_filters
from notify.service.sms_opportunity import schedule_opportunity_sms_for_audit_cycle_with_filters

def opportunity_notification_service(audit_cycle_id: int, filters: dict) -> bool:

    if filters.get('channel_name', '') == 'email':
        schedule_opportunity_emails_for_audit_cycle_with_filters(audit_cycle_id, filters)

    if filters.get('channel_name', '') == 'sms':
        schedule_opportunity_sms_for_audit_cycle_with_filters(audit_cycle_id, filters)

    if filters.get('channel_name', '') == 'whatsapp':
        schedule_opportunity_whatsapp_for_audit_cycle_with_filters(audit_cycle_id, filters)