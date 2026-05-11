from kronos.exceptions import AppLogicError
from guardian.shortcuts import get_objects_for_user
from audit_store import service as audit_store_service
from registration.service import manager as manager_service
from answer.models import ReportSection
from auditor.service.application_service import change_application_status_to_withdrawn
from registration.service.moderator import find_moderator_by_user_id
from audit_store.models import AuditStore, ReportStatusLog
from audit.models import AuditCycle,Audit
from attachment.service import set_attachment_by_audit_store, set_attachment_by_proof_tag
from manager.serializers import AuditSerializer
from client.models import MPOrder
import requests
import json

def set_report_attribute_value(audit_store_id, json_id, option_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        return audit_store_service.set_report_attribute_value(audit_store.id, json_id, option_id)
    else:
        raise AppLogicError("cannot set report attribute now")


def set_reimbursement(audit_store_id, reimbursement, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        audit_store.set_reimbursement(reimbursement)
        return audit_store
    else:
        raise AppLogicError("cannot set reimbursement now")

def set_earnings_per_audit(audit_store_id, earnings_per_audit, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)

    if audit_store.is_editable_by_manager():
        audit_store.set_earnings_per_audit(earnings_per_audit)
        return audit_store
    else:
        raise AppLogicError("cannot set earnings per audit now")


def set_report_summary(audit_store_id, report_summary, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    manager_service.find_manager_by_user_id(user_id)
    if audit_store.is_editable_by_manager():
        audit_store.set_report_summary(report_summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")


def submit_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    set_attachment_by_proof_tag(audit_store_id)
    audit_store.submit(by=user)
    return audit_store


def revert_submit_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    audit_store.report_revert_count+=1
    audit_store.save()
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.revert_submit(by=user, message=message)
    set_attachment_by_audit_store(audit_store_id)
    return audit_store


def qa_ok_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    set_attachment_by_proof_tag(audit_store_id)
    audit_store.qa_ok(by=user)
    return audit_store


def pm_revert_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.pm_revert(by=user)
    return audit_store

def get_sentiment_data(report_summary):
    # api_url = "http://api.floorwalk.in/text_analysis"
    api_url = "https://ai.floorwalk.in/text_analysis/"
    # api_url = "http://13.203.250.157/text_analysis"
    token = "12345"
    payload = {
        'token': token,
        'text': report_summary,
    }

    try:
        response = requests.post(api_url, data=payload,verify=False )
        if response.status_code == 200:
            data = response.json()
            keywords = data.get('keywords', {})
            key_sentences = data.get('key_sentences', {}) 
            emotions = data.get('emotions', {})
            positive_words = data.get('positive_words', [])
            negative_words = data.get('negative_words', [])
            sentiment_score = data.get('sentiment_score', '')
            sentiment_result = data.get('sentiment_result', '')
            
            return {
                'keywords': keywords,
                'key_sentences': key_sentences,
                'emotions': emotions,
                'positive_words': positive_words,
                'negative_words': negative_words,
                'sentiment_score': sentiment_score,
                'sentiment_result': sentiment_result
            }
        else:
            return {'error': 'Unknown'}
    except Exception as e:
        print("Error:", e)
        return {'error': 'Unknown'}

def complete_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    # set_attachment_by_proof_tag(audit_store_id)
    audit_store.complete(by=user)

    audit_cycle_id = audit_store.audit.audit_cycle.id
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)

    audit_ids = audit_cycle.audits.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__id__in=audit_ids)

    if audit_store.report_summary and audit_store.report_summary.strip():
        try:
            sentiment_data = get_sentiment_data(audit_store.report_summary)
            audit_store.main_keywords = sentiment_data.get('keywords')
            audit_store.bullet_points = sentiment_data.get('key_sentences')
            audit_store.sentiment_emotions = sentiment_data.get('emotions')
            audit_store.sentiment_positive_words = sentiment_data.get('positive_words')
            audit_store.sentiment_negative_words = sentiment_data.get('negative_words')
            audit_store.sentiment_score = sentiment_data.get('sentiment_score')
            audit_store.sentiment_text = sentiment_data.get('sentiment_result')
            audit_store.save()

        except Exception as e:
            print("Error in sentiment data: {}".format(e))
            pass
        
    mp_order = MPOrder.objects.get(id=audit_cycle.order.id) if audit_cycle.order else None
    if mp_order is not None:
        # store_ids = [audit_store.id for audit_store in audit_stores]
        total_audit_count = audit_cycle.audit_count()
        store_statuses = [audit_store.status for audit_store in audit_stores]

        if store_statuses.count('COMPLETED') + store_statuses.count('ACCEPTED') == total_audit_count:
            mp_order.status = 'COMPLETE'
            mp_order.save()
        else:
            mp_order.status = 'ACTIVE'
            mp_order.save()
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    else:
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    return audit_store

def revert_complete_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.revert_complete(by=user)

    audit_cycle_id = audit_store.audit.audit_cycle.id
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
    audit_ids = audit_cycle.audits.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__id__in=audit_ids)
    # store_ids = [audit_store.id for audit_store in audit_stores]
    mp_order = MPOrder.objects.get(id=audit_cycle.order.id) if audit_cycle.order else None
    if mp_order is not None:
        # store_ids = [audit_store.id for audit_store in audit_stores]
        total_audit_count = audit_cycle.audit_count()
        store_statuses = [audit_store.status for audit_store in audit_stores]

        if store_statuses.count('COMPLETED') + store_statuses.count('ACCEPTED') == total_audit_count:
            mp_order.status = 'COMPLETE'
            mp_order.save()
        else:
            mp_order.status = 'ACTIVE'
            mp_order.save()
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    else:
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    return audit_store


def accept_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.accept(by=user)
    
    audit_cycle_id = audit_store.audit.audit_cycle.id
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
    audit_ids = audit_cycle.audits.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__id__in=audit_ids)
    # store_ids = [audit_store.id for audit_store in audit_stores]
    mp_order = MPOrder.objects.get(id=audit_cycle.order.id) if audit_cycle.order else None
    if mp_order is not None:
        # store_ids = [audit_store.id for audit_store in audit_stores]
        total_audit_count = audit_cycle.audit_count()
        store_statuses = [audit_store.status for audit_store in audit_stores]

        if store_statuses.count('COMPLETED') + store_statuses.count('ACCEPTED') == total_audit_count:
            mp_order.status = 'COMPLETE'
            mp_order.save()
        else:
            mp_order.status = 'ACTIVE'
            mp_order.save()
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    else:
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    return audit_store


def reject_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.reject(by=user)

    audit_cycle_id = audit_store.audit.audit_cycle.id
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
    audit_ids = audit_cycle.audits.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__id__in=audit_ids)
    # store_ids = [audit_store.id for audit_store in audit_stores]
    mp_order = MPOrder.objects.get(id=audit_cycle.order.id) if audit_cycle.order else None
    if mp_order is not None:
        # store_ids = [audit_store.id for audit_store in audit_stores]
        total_audit_count = audit_cycle.audit_count()
        store_statuses = [audit_store.status for audit_store in audit_stores]

        if store_statuses.count('COMPLETED') + store_statuses.count('ACCEPTED') == total_audit_count:
            mp_order.status = 'COMPLETE'
            mp_order.save()
        else:
            mp_order.status = 'ACTIVE'
            mp_order.save()
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    else:
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    return audit_store


def fail_report(audit_store_id, user_id, message):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.fail(by=user, message=message)

    audit_cycle_id = audit_store.audit.audit_cycle.id
    audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
    audit_ids = audit_cycle.audits.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__id__in=audit_ids)
    # store_ids = [audit_store.id for audit_store in audit_stores]
    mp_order = MPOrder.objects.get(id=audit_cycle.order.id) if audit_cycle.order else None
    if mp_order is not None:
        # store_ids = [audit_store.id for audit_store in audit_stores]
        total_audit_count = audit_cycle.audit_count()
        store_statuses = [audit_store.status for audit_store in audit_stores]

        if store_statuses.count('COMPLETED') + store_statuses.count('ACCEPTED') == total_audit_count:
            mp_order.status = 'COMPLETE'
            mp_order.save()
        else:
            mp_order.status = 'ACTIVE'
            mp_order.save()
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    else:
        report_obj = ReportSection.objects.filter(audit_store=audit_store, not_applicable=False)
        for report in report_obj:
            report.save_percentage()
    return audit_store


def withdraw_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    audit_store.withdraw(by=user)
    # Change Audit Application Status to WITHDRAWN
    application_obj = change_application_status_to_withdrawn(audit_store_id)
    if application_obj is not None:
        application_obj.save()
    # End of Change Audit Application Status to WITHDRAWN
    return audit_store


def find_qa_pending_audit_stores_of_moderator_for_manager(user_id):
    # TODO: move this in to the AuditStoreQuerySet
    user = find_moderator_by_user_id(user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__status__in=AuditCycle.ALL_STATUSES,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED)
    ).order_by('audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)


def revert_report(audit_store_id, user_id):
    audit_store = audit_store_service.find_by_id(audit_store_id)
    user = manager_service.find_manager_by_user_id(user_id)
    report_status = ReportStatusLog.objects.filter(audit_store_id=audit_store_id)\
        .exclude(status__in=[AuditStore.FAILED, AuditStore.WITHDRAWN]).order_by('-id')[0].status
    if report_status == AuditStore.ASSIGNED or report_status == AuditStore.ACKNOWLEDGED:
        audit_store.revert_report(by=user, status=AuditStore.ACKNOWLEDGED)
        set_attachment_by_audit_store(audit_store_id)
    elif report_status == AuditStore.SUBMITTED:
        audit_store.revert_report(by=user, status=AuditStore.SUBMITTED)
    elif report_status == AuditStore.PM_REVIEW:
        audit_store.revert_report(by=user, status=AuditStore.PM_REVIEW)
    else:
        audit_store.revert_report(by=user, status=AuditStore.COMPLETED)
    return audit_store