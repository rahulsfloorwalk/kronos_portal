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
from collections import OrderedDict
from auditor.models import ProfileInfo
from datetime import datetime


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
    api_url = "https://ai1.floorwalk.in/text_analysis/"
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

def find_qa_repoprt_list_by_audit_cycle(audit_cycle_id,user_id):
    user = find_moderator_by_user_id(user_id)

    query_set = (
        AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id,
            status__in=[AuditStore.ASSIGNED,AuditStore.ACKNOWLEDGED,AuditStore.SUBMITTED,]
        )
        .select_related('audit','audit__audit_cycle',).order_by('audit_date'))
    return get_objects_for_user( user,'moderator_manage', klass=query_set, accept_global_perms=False)

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
 
def _resolve_comment(done_audits, pending_execution):
    if done_audits == 0 and pending_execution > 1:
        return 'High Risky'
    if done_audits == 0 and pending_execution == 1:
        return 'Low Risk'
    if pending_execution > 3 and done_audits != 0:
        return 'Contact Once'
    return 'No Interference Needed'

PRIORITY = {
    'High Risky': 1,
    'Low Risk': 2,
    'Contact Once': 3,
    'No Interference Needed': 4,
}

def find_auditor_execution_report(audit_cycle_id, status='', audit_date='', city_id='', comment=''):
    audit_stores = (AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id)
        .select_related('user','user__profileinfo','audit','audit__store','audit__store__city',)
        .order_by('user_id', 'audit_date'))

    if status:
        status_list = [s.strip() for s in status.split(',') if s.strip()]
        audit_stores = audit_stores.filter(status__in=status_list)

    if audit_date:
        try:
            audit_date = datetime.strptime(audit_date,'%d-%m-%Y').date()
        except ValueError:
            raise AppLogicError('Invalid audit date. Use DD-MM-YYYY.')

        audit_stores = audit_stores.filter(audit_date=audit_date)

    if city_id:
        city_id_list = [ i.strip() for i in city_id.split(',') if i.strip()]
        audit_stores = audit_stores.filter( audit__store__city_id__in=city_id_list)

    auditor_data = OrderedDict()
    for audit_store in audit_stores:
        user = audit_store.user
        if user.id not in auditor_data:
            try:
                profile_info = user.profileinfo
            except ProfileInfo.DoesNotExist:
                profile_info = None
            if profile_info:
                auditor_name = '{} {}'.format(profile_info.first_name or '',profile_info.last_name or '').strip()
                auditor_mobile_number = profile_info.mobile_number
            else:
                auditor_name = user.email
                auditor_mobile_number = None

            auditor_data[user.id] = {
                'id': user.id,
                'auditor_name': auditor_name,
                'auditor_mobile_number': auditor_mobile_number,
                'cities': [],
                'audit_dates': [],
                'report_status': [],
                'grand_total': 0,
                'pending_execution': 0,
                'done_audits': 0,
                'failed_reports': 0,
            }

        data = auditor_data[user.id]
        data['grand_total'] += 1
        status_value = audit_store.status
        city = audit_store.audit.store.city

        if city and city.name not in data['cities']:
            data['cities'].append(city.name)
        if audit_store.audit_date:
            audit_date_value = audit_store.audit_date.strftime('%d-%m-%Y')

            if audit_date_value not in data['audit_dates']:
                data['audit_dates'].append(audit_date_value)

        if status_value not in data['report_status']:
            data['report_status'].append(status_value)

        if status_value in (AuditStore.ACKNOWLEDGED,AuditStore.ASSIGNED):
            data['pending_execution'] += 1

        elif status_value in (AuditStore.COMPLETED,AuditStore.PM_REVIEW,AuditStore.SUBMITTED):
            data['done_audits'] += 1

        elif status_value in (AuditStore.AUDITOR_WITHDRAWN,AuditStore.WITHDRAWN,AuditStore.FAILED):
            data['failed_reports'] += 1

    result = []

    for data in auditor_data.values():
        pending_execution = data['pending_execution']
        done_audits = data['done_audits']

        if pending_execution <= 0:
            continue

        calculated_comment = _resolve_comment(done_audits,pending_execution)
        if comment and calculated_comment != comment:
            continue

        result.append({
            'id': data['id'],
            'auditor_name': data['auditor_name'],
            'auditor_mobile_number': data['auditor_mobile_number'],
            'cities': ', '.join(data['cities']),
            'audit_dates': ', '.join(data['audit_dates']),
            'report_status': ', '.join(data['report_status']),
            'grand_total': data['grand_total'],
            'pending_execution': pending_execution,
            'done_audits': done_audits,
            'failed_reports': data['failed_reports'],
            'comment': calculated_comment,
        })

    result.sort(key=lambda x: (PRIORITY[x['comment']],-x['grand_total']))
    return result

def find_auditor_execution_report_details(audit_cycle_id, user_id, status=''):
    audit_stores = (
        AuditStore.objects
        .filter(audit__audit_cycle_id=audit_cycle_id,user_id=user_id)
        .select_related('user','user__profileinfo','audit','audit__store','audit__store__city','audit__audit_cycle',)
        .order_by('audit_date', 'id'))

    if status == 'pending':
        audit_stores = audit_stores.filter(status__in=[AuditStore.ACKNOWLEDGED,AuditStore.ASSIGNED,])

    elif status == 'completed':
        audit_stores = audit_stores.filter(status__in=[AuditStore.COMPLETED,AuditStore.PM_REVIEW,AuditStore.SUBMITTED,])

    elif status == 'failed':
        audit_stores = audit_stores.filter(status__in=[AuditStore.AUDITOR_WITHDRAWN,AuditStore.WITHDRAWN,AuditStore.FAILED,])

    result = []

    for audit_store in audit_stores:
        city = None

        if audit_store.audit.store.city:
            city = audit_store.audit.store.city.name

        result.append({
            'audit_store_id': audit_store.id,
            'audit_date': audit_store.audit_date,
            'status': audit_store.status,
            'city': city,
            'store_name': audit_store.audit.store.name,
            'auditor_name': (
                '{} {}'.format( audit_store.user.profileinfo.first_name or '', audit_store.user.profileinfo.last_name or '').strip()
                if hasattr(audit_store.user, 'profileinfo')
                else audit_store.user.email),
            'auditor_mobile_number': (audit_store.user.profileinfo.mobile_number if hasattr(audit_store.user, 'profileinfo') else None),
            'earnings_per_audit': audit_store.earnings_per_audit,
            'reimbursement': audit_store.reimbursement,
            'auto_assigned': audit_store.auto_assigned,
            'instant_assigned': audit_store.instant_assigned,
            'assigned_by': audit_store.assigned_by,
            'submit_at': audit_store.submit_at,
            'audit_store_percentage': audit_store.report_completion_percentage,
        })

    return result

def find_auditor_execution_report_filters(audit_cycle_id):
    audit_stores = (AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id).select_related('audit__store__city'))

    statuses = []
    cities = []
    audit_dates = []
    comments = []

    status_values = audit_stores.values_list('status',flat=True).distinct()
    for status in status_values:
        if status and status not in statuses:
            statuses.append(status)

    city_values = audit_stores.filter(audit__store__city__isnull=False).values('audit__store__city__id','audit__store__city__name').distinct().order_by('audit__store__city__name')

    for city in city_values:
        cities.append({
            'id': city['audit__store__city__id'],
            'name': city['audit__store__city__name']
        })

    audit_date_values = audit_stores.filter(audit_date__isnull=False).values_list('audit_date',flat=True).distinct().order_by('audit_date')
    for audit_date in audit_date_values:
        audit_date_value = audit_date.strftime('%d-%m-%Y')
        if audit_date_value not in audit_dates:
            audit_dates.append(audit_date_value)

    auditor_data = OrderedDict()

    for audit_store in audit_stores.order_by('user_id', 'audit_date'):
        user_id = audit_store.user_id
        if user_id not in auditor_data:
            auditor_data[user_id] = {'pending_execution': 0,'done_audits': 0}

        if audit_store.status in (AuditStore.ACKNOWLEDGED,AuditStore.ASSIGNED):
            auditor_data[user_id]['pending_execution'] += 1

        elif audit_store.status in (AuditStore.COMPLETED,AuditStore.PM_REVIEW,AuditStore.SUBMITTED):
            auditor_data[user_id]['done_audits'] += 1

    for data in auditor_data.values():
        if data['pending_execution'] <= 0:
            continue

        calculated_comment = _resolve_comment(data['done_audits'],data['pending_execution'] )
        if calculated_comment not in comments:
            comments.append(calculated_comment)

    comments.sort( key=lambda value: PRIORITY[value])
    return {
        'status': statuses,
        'city': cities,
        'audit_date': audit_dates,
        'comment': comments
    }