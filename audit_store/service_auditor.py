from django.db.transaction import atomic
from kronos.exceptions import AppLogicError
from audit_store import service as audit_store_service
from registration.service import auditor as auditor_service
from django.utils import timezone
from audit_store.models import AuditStore, ReportStatusLog
from django.conf import settings
from notify.service.mail_fail_audit_report import send_audit_report_failed_email
from notify.service.mail_withdraw_audit_report import send_audit_report_withdraw_email
from notify.service.mail_concern_audit_report import send_audit_report_concern_email
from auditor.service.application_service import change_application_status_to_withdrawn
from client.service.client_manager import get_manager_email_list_by_audit_store_obj
from audit.service.audit_cycle_proof_tag import get_status_of_audit_cycle_proof_tag_by_audit_cycle_id
from attachment.service import set_attachment_by_proof_tag
from audit_store.service_moderator import get_moderator_email_by_audit_store_obj
from answer.service.answer_auditor import add_multiselect_answer_questions


@atomic
def acknowledge_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be acknowledged by user")

    audit_store.acknowledge(by=user)
    return audit_store


@atomic
def set_report_summary(audit_store_id, user_id, report_summary):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    if audit_store.is_editable_by_auditor():
        audit_store.set_report_summary(report_summary)
        audit_store.copy_report_summary()
        return audit_store
    else:
        raise AppLogicError("Cannot set report summary of current audit store")



@atomic
def submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    audit_cycle_proof_tag = get_status_of_audit_cycle_proof_tag_by_audit_cycle_id(audit_store.audit.audit_cycle.id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be submitted by user")
    if not audit_store.is_submittable():
        raise AppLogicError("Please complete all answers and all section summaries before submitting")
    if not audit_store.check_auditor_comment_len():
        raise AppLogicError("Section summary should be greater than 30 characters")
    if audit_cycle_proof_tag:
        if audit_store.is_proof_tag_not_given_for_attachments():
            raise AppLogicError("Please select a tag for all attachments. You can select a tag by clicking on the "
                                "drop-down present below the attachment.")
    set_attachment_by_proof_tag(audit_store_id)
    audit_store.submit_auditor(by=user)
    add_multiselect_answer_questions(audit_store_id, user_id)
    return audit_store

@atomic
def fail_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be failed by user")

    audit_store.status = AuditStore.FAILED
    audit_store.qa_rating = AuditStore.BAD
    audit_store.save()

    # Save Data in Report Status Log
    report_status_log = ReportStatusLog()
    report_status_log.user_actor = user
    report_status_log.status = AuditStore.FAILED
    report_status_log.message = message
    report_status_log.audit_store = audit_store
    report_status_log.created_at = timezone.now()
    report_status_log.save()
    # End of Save Data in Report Status Log

    # Send Mail to manager or "shubham.mohod@floorwalk.in"
    if settings.EMAIL_SWITCH['AUDIT_REPORT_FAILED_BY_AUDITOR_EMAIL']:
        email_list = get_manager_email_list_by_audit_store_obj(audit_store)
        if email_list:
            emails = email_list
        else:
            emails = ["shubham.mohod@floorwalk.in"]
        for email in emails:
            send_audit_report_failed_email.delay(email, audit_store_id, message)
    # End of Send Mail to manager or "shubham.mohod@floorwalk.in"
    return audit_store


@atomic
def withdraw_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)
    if user != audit_store.user:
        raise AppLogicError("Report cannot be withdrawn by user")

    audit_store.status = AuditStore.AUDITOR_WITHDRAWN
    audit_store.save()

    # Save Data in Report Status Log
    report_status_log = ReportStatusLog()
    report_status_log.user_actor = user
    report_status_log.status = AuditStore.AUDITOR_WITHDRAWN
    report_status_log.message = message
    report_status_log.audit_store = audit_store
    report_status_log.created_at = timezone.now()
    report_status_log.save()
    # End of Save Data in Report Status Log

    # Chnage Audit Application Status to WITHDRAWN
    application_obj = change_application_status_to_withdrawn(audit_store_id)
    if application_obj is not None:
        application_obj.save()
    # End of Change Audit Application Status to WITHDRAWN

    # Send Mail to manager or "shubham.mohod@floorwalk.in"
    if settings.EMAIL_SWITCH['AUDIT_REPORT_WITHDRAW_BY_AUDITOR_EMAIL']:
        email_list = get_manager_email_list_by_audit_store_obj(audit_store)
        if email_list:
            emails = email_list
        else:
            emails = ["shubham.mohod@floorwalk.in"]
        for email in emails:
            send_audit_report_withdraw_email.delay(email, audit_store_id, message)
    # End of Send Mail to manager or "shubham.mohod@floorwalk.in"
    return audit_store


def concern_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id_for_auditor(audit_store_id, user_id)
    user = auditor_service.find_auditor_by_id(user_id)

    if user != audit_store.user:
        raise AppLogicError("Concern not accepted by user")
    if audit_store.status not in [AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED]:
        raise AppLogicError("Concern not accepted by user")

    # Send Mail to manager or "shubham.mohod@floorwalk.in"
    if settings.EMAIL_SWITCH['AUDIT_REPORT_CONCERN_BY_AUDITOR_EMAIL']:
        email_list = get_manager_email_list_by_audit_store_obj(audit_store)
        moderator_email = get_moderator_email_by_audit_store_obj(audit_store)
        if moderator_email:
            email_list.append(moderator_email)
        if email_list:
            emails = email_list
        else:
            emails = ["shubham.mohod@floorwalk.in"]
        for email in emails:
            send_audit_report_concern_email.delay(email, audit_store_id, user_id, message)
    # End of Send Mail to manager or "shubham.mohod@floorwalk.in"
    return audit_store
