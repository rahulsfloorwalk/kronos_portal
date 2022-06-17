from kronos.exceptions import AppLogicError
from notify.models import OpportunityEmailRecord, OpportunitySmsRecord, OpportunityWhatsappRecord
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
    return True


def find_next_users_for_notification(city_id: int, audit_cycle_id: int, channel:str, filtered_auditors: list) -> list:
    if channel == 'email':
        opportunity_list = OpportunityEmailRecord.objects.filter(city_id = city_id, audit_cycle_id = audit_cycle_id, record_data__has_key = 'user_list').values_list('record_data', flat = True)
    elif channel == 'sms':
        opportunity_list = OpportunitySmsRecord.objects.filter(city_id = city_id, audit_cycle_id = audit_cycle_id, record_data__has_key = 'user_list').values_list('record_data', flat = True)
    elif channel == 'whatsapp':
        opportunity_list = OpportunityWhatsappRecord.objects.filter(city_id = city_id, audit_cycle_id = audit_cycle_id, record_data__has_key = 'user_list').values_list('record_data', flat = True)
    else:
        raise AppLogicError("Invalid channel type")

    filtered_auditors = set(filtered_auditors)
    sent_user_list = set()
    for record in opportunity_list:
        sent_user_list.update(record.get('user_list',[]))

    new_user_list = filtered_auditors.difference(sent_user_list)
    return list(new_user_list)