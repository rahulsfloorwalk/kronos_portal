from django.db.transaction import atomic
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from audit.service.audit_cycle_proof_tag import get_audit_cycle_proof_tag_for_attachment

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.service.moderator import find_moderator_by_user_id,find_auditor_by_user_id

from audit.models import AuditCycle
from audit_store.models import AuditStore
import audit.service.audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from attachment.service import set_attachment_by_audit_store, set_attachment_by_proof_tag
from audit.models import Audit
from client.models import Store
from datetime import date, timedelta
from datetime import datetime

import requests
from django.utils import timezone
from rest_framework.response import Response
from answer.models import Answer
from attachment.models import Attachment
from answer.service import answer as answer_service
from .models import ReportStatusLog
import logging
_logger = logging.getLogger(__name__)

# def find_qa_completed_audit_stores_for_moderator(user_id, lastAuditStoreDate, filterStatus, client_id, month, year):
#     # TODO: move this in to the AuditStoreQuerySet
#     count = 0
#     user = find_moderator_by_user_id(user_id)
#     if filterStatus != "" and lastAuditStoreDate != "":
#         query_set = AuditStore.objects.filter(
#             audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
#             status=filterStatus,
#             audit_date__gte=lastAuditStoreDate
#         ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
#                            'audit__store__city').order_by('audit_date')
#         if client_id:
#             query_set = query_set.filter(audit__audit_cycle__client = client_id)
#         data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
#     elif filterStatus != "":
#         query_set = AuditStore.objects.filter(
#             audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
#             status=filterStatus
#         ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
#                            'audit__store__city').order_by('audit_date')
#         if client_id:
#             query_set = query_set.filter(audit__audit_cycle__client = client_id)
#         data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
#     elif lastAuditStoreDate != "":
#         query_set = AuditStore.objects.filter(
#             audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
#             status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW),
#             audit_date__gte=lastAuditStoreDate
#         ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
#                            'audit__store__city').order_by('audit_date')
#         if client_id:
#             query_set = query_set.filter(audit__audit_cycle__client = client_id)
#         data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
#     else:
#         query_set = AuditStore.objects.filter(
#             audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
#             status__in=(AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED, AuditStore.PM_REVIEW)
#         ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
#                            'audit__store__city').order_by('audit_date')
#         if client_id:
#             query_set = query_set.filter(audit__audit_cycle__client = client_id)
#         data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
#         count = data.count()
#     return data[0:200], count

from datetime import datetime

def find_audit_store_status_logs(audit_store_id):
    logs = ReportStatusLog.objects.filter(audit_store_id=audit_store_id).select_related('user_actor').order_by('-created_at')
    if not logs.exists():
        raise ObjectNotFound
    return logs

def find_qa_completed_audit_stores_for_moderator(user_id, lastAuditStoreDate, filterStatus, client_id, month, year,audit_date):
    user = find_moderator_by_user_id(user_id)
    if filterStatus != "" and lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(status=filterStatus,audit_date__gte=lastAuditStoreDate)

    elif filterStatus != "":
        query_set = AuditStore.objects.filter(status=filterStatus)

    elif lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            status__in=(AuditStore.FAILED,AuditStore.COMPLETED,AuditStore.ACCEPTED,AuditStore.REJECTED,AuditStore.PM_REVIEW),
            audit_date__gte=lastAuditStoreDate)
    else:
        query_set = AuditStore.objects.filter(
            status__in=(AuditStore.FAILED,AuditStore.COMPLETED,AuditStore.ACCEPTED,AuditStore.REJECTED,AuditStore.PM_REVIEW))

    now = datetime.now()

    if month in [None, ""] and year in [None, ""]:
        month = now.month
        year = now.year
    else:
        try:
            month = int(month) if month not in [None, ""] else now.month
        except (ValueError, TypeError):
            month = now.month

        try:
            year = int(year) if year not in [None, ""] else now.year
        except (ValueError, TypeError):
            year = now.year

    # query_set = query_set.filter(
    #     moderator_submission_date__year=year,
    #     moderator_submission_date__month=month,
    #     moderator_submission_date__isnull=False
    # )

    if client_id not in [None, ""]:
        query_set = query_set.filter(audit__audit_cycle__client=client_id)

    if audit_date not in [None, ""]:
        audit_date = str(audit_date)
        audit_date = datetime.strptime(audit_date,"%Y-%m-%d").date()

        query_set = query_set.filter(audit_date=audit_date)
    query_set = query_set.select_related(
        'audit',
        'audit__audit_cycle',
        'audit__audit_cycle__client',
        'audit__store',
        'audit__store__city'
    ).order_by('moderator_submission_date')

    data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
    # count = data.count()

    # return data, count
    auditStores = []

    for audit_store in data:

        if audit_store.status == AuditStore.FAILED:
            if audit_store.failed_by != AuditStore.MANUAL:
                continue

            if audit_store.moderator_submission_date:
                if (
                    audit_store.moderator_submission_date.year == year
                    and audit_store.moderator_submission_date.month == month
                ):
                    auditStores.append(audit_store)

            elif (
                audit_store.modified_at
                and audit_store.modified_at.year == year
                and audit_store.modified_at.month == month
            ):
                auditStores.append(audit_store)

        else:
            if (
                audit_store.moderator_submission_date
                and audit_store.moderator_submission_date.year == year
                and audit_store.moderator_submission_date.month == month
            ):
                auditStores.append(audit_store)

    return auditStores, len(auditStores)

def find_qa_pending_audit_stores_for_moderator(user_id, lastAuditStoreDate, filterStatus, client_id, start_date, end_date):
    # TODO: move this in to the AuditStoreQuerySet
    count = 0
    user = find_moderator_by_user_id(user_id)
    today = date.today()
    if filterStatus == "CRITICAL_REPORT":
        four_days_ago = today - timedelta(days=4)
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            audit_date__lte=four_days_ago
        ).prefetch_related(
            'audit', 'audit__audit_cycle', 'audit__audit_cycle__client',
            'audit__store', 'audit__store__city'
        ).order_by('audit_date')

        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client=client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    elif filterStatus == "REVERTED_REPORT":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            report_revert_count__gt=0
        ).prefetch_related(
            'audit', 'audit__audit_cycle', 'audit__audit_cycle__client',
            'audit__store', 'audit__store__city'
        ).order_by('audit_date')

        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client=client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    elif filterStatus != "" and lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus, audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    elif filterStatus != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status=filterStatus
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    elif lastAuditStoreDate != "":
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED),
            audit_date__gte=lastAuditStoreDate
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client=client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()
    else:
        query_set = AuditStore.objects.filter(
            audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES,
            status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED)
        ).prefetch_related('audit', 'audit__audit_cycle', 'audit__audit_cycle__client', 'audit__store',
                           'audit__store__city').order_by('audit_date')
        if client_id:
            query_set = query_set.filter(audit__audit_cycle__client = client_id)
        if start_date and end_date:
            query_set = query_set.filter(audit_date__range=[start_date, end_date])
        elif start_date:
            query_set = query_set.filter(audit_date__gte=start_date)
        elif end_date:
            query_set = query_set.filter(audit_date__lte=end_date)

        data = get_objects_for_user(user, 'moderator_manage', klass=query_set)
        count = data.count()

    return data[0:200], count


def find_by_audit_cycle_for_moderator(audit_cycle_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_cycle = audit_cycle_service.find_by_id_for_moderator(audit_cycle_id, user_id)
    query_set = AuditStore.objects.filter(
        audit__audit_cycle__id=audit_cycle.id,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED)
    ).order_by('-audit_date')

    return get_objects_for_user(user, 'moderator_manage', klass=query_set)


def find_stores_by_client(client_id):
    return Store.objects.filter(client_id=client_id).order_by('city__name').select_related('client','city')

def find_audit_by_id(audit_id):
    try:
        return Audit.objects.get(pk=audit_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e
    
def create_audit_by_store(data):
    audit_cycle_id = data.get('audit_cycle')
    store_id = data.get('store')
    if not store_id:
        raise AppLogicError("Please Choose at any One Store")
    if not audit_cycle_id:
        raise AppLogicError("Audit cycle is required.")

    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    store_exists = Store.objects.filter(client=audit_cycle.client.id, id=store_id).exists()
    if not store_exists:
        raise AppLogicError("The specified store does not exist for this client.")
    store_exists = Store.objects.filter(client = audit_cycle.client.id).exists()
    if not store_exists:
        raise AppLogicError("Stores are not found in This Client")
    
    audit_data = {
        'count': data.get('count', 1),
        'earnings_per_audit': data.get('earnings_per_audit', audit_cycle.earnings_per_audit),
        'reimbursement': data.get('reimbursement', audit_cycle.reimbursement),
        'store_id': store_id,
        'audit_cycle': audit_cycle,
        'post_approval_description': data.get('post_approval_description', '')
    }
    audit = Audit.objects.create(**audit_data)
    return audit
    
def find_by_id_for_moderator(audit_store_id, user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        audit_store = AuditStore.objects.get(
            pk=audit_store_id,
            status__in=[
                AuditStore.ASSIGNED,
                AuditStore.ACKNOWLEDGED,
                AuditStore.SUBMITTED,
                AuditStore.PM_REVIEW,
                AuditStore.FAILED,
                AuditStore.COMPLETED,
                AuditStore.ACCEPTED,
                AuditStore.REJECTED,
            ]
        )
        if user.has_perm('moderator_manage', audit_store):
            return audit_store
        else:
            raise ObjectNotFound
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
    
def find_by_id_for_auditor(audit_store_id, user_id):
    try:
        user = find_auditor_by_user_id(user_id)
        audit_store = AuditStore.objects.get(
            pk=audit_store_id,
            status__in=[
                AuditStore.ASSIGNED,
                AuditStore.ACKNOWLEDGED,
                AuditStore.SUBMITTED,
                AuditStore.PM_REVIEW,
                AuditStore.FAILED,
                AuditStore.COMPLETED,
                AuditStore.ACCEPTED,
                AuditStore.REJECTED,
            ]
        )
        if audit_store:
            return audit_store
        # if user.has_perm('moderator_manage', audit_store):
        #     return audit_store
        # else:
        #     raise ObjectNotFound
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def fail_for_moderator(audit_store_id, user_id, message):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    audit_store.fail(by=user, message=message)
    return audit_store


@atomic
def submit_for_moderator(audit_store_id, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    set_attachment_by_proof_tag(audit_store_id)
    audit_store.submit(by=user)
    return audit_store


@atomic
def set_audit_date_for_moderator(audit_store_id, audit_date, user_id):
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user.id)
    return audit_store_service.set_audit_date(audit_store.id, audit_date)

@atomic
def unsubmit_for_moderator(audit_store_id, user_id, message, missing_proofs=[]):
    audit_store=AuditStore.objects.get(id=audit_store_id)
    audit_store.report_revert_count+=1
    audit_store.save()
    user = find_moderator_by_user_id(user_id)
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    missing_proof_names = []
    if missing_proofs:
        proof_tag_list = get_audit_cycle_proof_tag_for_attachment(audit_store.audit.audit_cycle.id)
        for proof in proof_tag_list:
            if proof['id'] in missing_proofs:
                missing_proof_names.append(proof['proof_tag'])

    audit_store.revert_submit(by=user, message=message, proof_tags=missing_proof_names)
    set_attachment_by_audit_store(audit_store_id)
    return audit_store

def set_reimbursement_for_moderator(audit_store_id, reimbursement, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    if audit_store.is_editable_by_moderator():
        audit_store.set_reimbursement(reimbursement)
        return audit_store
    else:
        raise AppLogicError("cannot set reimbursement now")

def set_earnings_per_audit_for_moderator(audit_store_id, earnings_per_audit, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)

    if audit_store.is_editable_by_moderator():
        audit_store.set_earnings_per_audit(earnings_per_audit)
        return audit_store
    else:
        raise AppLogicError("cannot set earnings per audit now")

def set_report_summary(audit_store_id, report_summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary(report_summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")

def set_back_to_original_report_summary(audit_store_id,summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary_back_to_original(summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")

def set_report_summary_updated(audit_store_id, report_summary, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if audit_store.is_editable_by_moderator():
        audit_store.set_report_summary_updated(report_summary)
        return audit_store
    else:
        raise AppLogicError("cannot set report summary now")

def set_moderator_status(audit_store_id, moderator_status, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id,user_id)
    audit_store.set_moderator_status(moderator_status)
    return audit_store

def set_moderator_comment(audit_store_id, moderator_comment, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    if len(moderator_comment) > 2999:
        raise AppLogicError("Comment should not be greater than 3000 character")
    audit_store.set_moderator_comment(moderator_comment)
    return audit_store

def set_check_points(audit_store_id, check_points, user_id):
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    db_check_points = audit_store.check_points
    for i in db_check_points:
        if i in check_points:
            db_check_points[i]['value'] = True
        else:
            db_check_points[i]['value'] = False
    audit_store.set_check_points(db_check_points)
    return audit_store


def get_moderator_email_by_audit_store_obj(audit_store):
    users_with_perms = get_users_with_perms(audit_store, attach_perms=True)
    for user, perms in users_with_perms.items():
        if 'moderator_manage' in perms:
            return user.email
    return None

def _post(url, payload):
    try:
        # payload["token"] = "FW_AI_9x2LmPq_82Ksa_26"
        response = requests.post(url,json=payload,timeout=300,verify=False)
        return response, None
    except requests.exceptions.RequestException as e:
        return None, ({"error": "AI service request failed","details": str(e)}, 500)

def _json(response):
    try:
        return response.json(), None
    except Exception:
        return None, ({"error": "Invalid JSON from AI service","raw_response": response.text}, 500)

def _valid(value):
    return value and str(value).strip() not in ("", "null", "None")


def audio_to_fill_answers(data,user_id):
    transcript_texts = data.get("transcript_texts", [])
    question_answer_detail = data.get("question_answer_detail", [])
    audit_store_id = data.get("audit_store_id")
    API_TOKEN = "FW_AI_9x2LmPq_82ata_26"

    clean_texts = [t.strip() for t in transcript_texts if t and str(t).strip()]

    if not clean_texts:
        return {"error": "Missing valid transcript_texts"}, 400

    if not question_answer_detail:
        return {"error": "Missing question_answer_detail"}, 400

    response, error = _post(
        "https://ai1.floorwalk.in/audio_to_answers/",
        {
            "transcript_texts": clean_texts,
            "question_detail": question_answer_detail,
            "token": API_TOKEN
        }
    )
    if error:
        return error

    result, error = _json(response)
    if error:
        return error

    # Save only 100% matched answers here
    comparison = result.get("comparison", [])
    updates = []

    for row in comparison:
        try:
            question_id = int(row.get("question_id"))
        except:
            continue

        ai_answer = row.get("ai_answer")
        decision = row.get("decision")

        if not ai_answer:
            continue

        ai_answer = str(ai_answer).strip()
        if ai_answer.lower() in ["null", "none", ""]:
            continue

        if decision not in ["autofill", "review"]:
            continue

        updates.append((question_id, ai_answer, row))

    for question_id, ai_answer, row in updates:
        try:
            answer = answer_service.submit_answer(
            audit_store_id=audit_store_id,
                question_id=question_id,
                user_id=user_id,
                answer_text=ai_answer,
                status=True
            )
            # answer.ai_answer_text = ai_answer
            answer.ai_answer_auditor_text = ai_answer
            answer.ai_decision_auditor = row.get("decision")
            answer.ai_final_confidence_percentage = int(row.get("final_confidence", 0))

            answer.save()
        except Exception as e:
            continue

    return {"status": "success", "data": result}, 200

def transcript_to_compare_answers(data):
    transcript_texts = data.get("transcript_texts", [])
    question_answer_detail = data.get("question_answer_detail", [])
    clean_texts = [t.strip() for t in transcript_texts if t and str(t).strip()]
    API_TOKEN = "FW_AI_2c3IxVa_36ttca_26"

    if not clean_texts:
        return {"error": "Missing valid transcript_texts"}, 400
    if not question_answer_detail:
        return {"error": "Missing question_answer_detail"}, 400

    response, error = _post(
        "https://ai1.floorwalk.in/transcript_to_compare_answers/",
        {
            "transcript_texts": clean_texts,
            "question_answer_detail": question_answer_detail,
            "token": API_TOKEN
        }
    )
    if error:
        return error
    if response.status_code != 200:
        return {"error": "AI service failed","status_code": response.status_code,"raw_response": response.text}, 500

    result, error = _json(response)
    if error:
        return error

    try:
        comparison = result.get("comparison", [])
        updates = []
        for item in comparison:
            question_id = item.get("question_id")
            ai_answer = item.get("ai_answer")

            if not question_id or not ai_answer or not str(ai_answer).strip():
                continue

            updates.append((question_id,ai_answer,item.get("match_percentage"),item.get("result")))
        for question_id, ai_answer, match_percentage, result_value in updates:
            Answer.objects.filter(question_id=question_id).update(ai_answer_text=ai_answer,ai_match_percentage=match_percentage,ai_answer_result=result_value)
    except Exception:
        pass

    return {"status": "success", "data": result}, 200

def audio_to_text(data):
    attachment_id = data.get("attachment_id")
    audio_url = data.get("audio_url")
    force = data.get("force", False)
    API_TOKEN = "FW_AI_5f7JlOs_97att_26"

    if not attachment_id and not audio_url:
        return {"error": "attachment_id or audio_url is required"}, 400

    attachment = None

    if attachment_id:
        attachment = Attachment.objects.filter(id=attachment_id,proof_type=Attachment.AUDIO).only("id","file_slug","audio_to_text_row","audio_to_text_clean","modified_at").first()
        if not attachment:
            return {"error": "Audio attachment not found"}, 404
        audio_url = attachment.direct_url()

    else:
        file_slug = audio_url.split(".com/")[-1] if ".com/" in audio_url else audio_url
        attachment = Attachment.objects.filter(
            file_slug=file_slug,
            proof_type=Attachment.AUDIO
        ).only(
            "id",
            "file_slug",
            "audio_to_text_row",
            "audio_to_text_clean",
            "modified_at"
        ).first()

    if (not force and attachment and _valid(attachment.audio_to_text_row) and _valid(attachment.audio_to_text_clean)):
        return {
            "status": "success",
            "source": "cache",
            "attachment_id": attachment.id,
            "audio_url": audio_url,
            "raw_transcript": attachment.audio_to_text_row,
            "transcript": attachment.audio_to_text_clean
        }, 200

    response, error = _post(
        "https://ai1.floorwalk.in/audio_to_text/",
        {"audio_url": audio_url,
         "token": API_TOKEN
        }
    )
    if error:
        _logger.error("POST ERROR: %s", error)
        return error
    _logger.info("STATUS: %s", response.status_code)
    _logger.info("BODY: %s", response.text)

    if response.status_code != 200:
        _logger.error("AI status=%s", response.status_code)
        _logger.error("AI body=%s", response.text)

        return {
            "error": "AI service failed","status_code": response.status_code,"body": response.text}, 500

    result, error = _json(response)
    if error:
        _logger.error("JSON ERROR: %s", error)
        return error
    if response.status_code != 200:
        return {"error": "AI service failed", "details": result}, 500

    raw_transcript = result.get("raw_transcript") or ""
    clean_transcript = result.get("transcript") or ""

    if attachment:
        attachment.audio_to_text_row = raw_transcript
        attachment.audio_to_text_clean = clean_transcript
        attachment.modified_at = timezone.now()
        attachment.save(update_fields=[
            "audio_to_text_row",
            "audio_to_text_clean",
            "modified_at"
        ])

    return {
        "status": "success",
        "source": "ai_service" if force or not attachment else "cache",
        "attachment_id": attachment.id if attachment else None,
        "audio_url": audio_url,
        "raw_transcript": raw_transcript,
        "transcript": clean_transcript
    }, 200

def find_by_id_for_nps(audit_store_id):
    try:
        return AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
    
@atomic
def set_nps_section(audit_store_id, user_id, nps_section):
    audit_store = find_by_id_for_nps(audit_store_id)

    audit_store.set_nps_section(nps_section)
    return audit_store