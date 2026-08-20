from calendar import monthrange
from django.contrib.auth.models import Group
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_MANAGER
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from guardian.models import UserObjectPermission

from payment.models import Payment
from audit.models import AuditCycle
from audit_store.models import AuditStore, ReportStatusLog
from django.db.models import Sum, F, Q, Count
from client.models import Client
import logging
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from guardian.shortcuts import assign_perm
from datetime import date
from collections import defaultdict
from django.db.models import Prefetch
from audit_store.service_moderator import get_report_count_date
User = get_user_model()

_logger = logging.getLogger(__name__)

def get_auditor_payment_report(month, year, payment_type, client):
    if client:
        query = Q(client = client)
    else:
        query = Q()
    if month and year:
        audit_cycles = AuditCycle.objects.filter(query, start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(query, start_date__year = year).order_by('end_date').select_related('client')

    response = []
    for audit_cycle in audit_cycles:
        obj = {}

        audit_stores = AuditStore.objects.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])

        payment_count = Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle.id)
        payment_paid_count = payment_count.filter(audit_store__audit__audit_cycle_id=audit_cycle.id).filter(status=Payment.PAID).count()

        audit_price = audit_stores.aggregate(reim_sum = Sum('reimbursement'), ear_sum = Sum('earnings_per_audit'))

        if audit_stores.count() == 0 and payment_count.count() == 0:
            payment_status = ''
        elif audit_stores.count() == payment_paid_count:
            payment_status = 'Paid'
        else:
            payment_status = 'Pending'

        if payment_type == "":
            pass
        elif payment_status == 'Pending' and payment_type == 'pending':
            pass
        elif payment_status == 'Paid' and payment_type == 'paid':
            pass
        else:
            continue

        reimbursement = audit_price['reim_sum'] if audit_price['reim_sum'] else 0
        earnings_per_audit = audit_price['ear_sum'] if audit_price['ear_sum'] else 0

        cycle_earnings_per_audit = audit_cycle.earnings_per_audit if audit_cycle.earnings_per_audit else 0
        cycle_reimbursement = audit_cycle.reimbursement if audit_cycle.reimbursement else 0

        if (reimbursement + earnings_per_audit) < 1:
            payment_status = ""

        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client_id'] = audit_cycle.client.id
        obj['client'] = audit_cycle.client.name
        obj['month'] = audit_cycle.start_date.month
        obj['year'] = audit_cycle.start_date.year
        obj['payment_status'] = payment_status
        obj['reimbursement'] = reimbursement
        obj['earnings_per_audit'] = earnings_per_audit
        obj['auditor_payment'] = reimbursement + earnings_per_audit
        obj['est_auditor_payment'] = audit_cycle.planned_audit * (cycle_earnings_per_audit + cycle_reimbursement)
        response.append(obj)
    return response


def get_billing_report(month, year, client):
    if client:
        query = Q(client = client)
    else:
        query = Q()

    if month and year:
        audit_cycles = AuditCycle.objects.filter(query, start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(query, start_date__year = year).order_by('end_date').select_related('client')

    response = []
    for audit_cycle in audit_cycles:
        obj = {}

        audit_stores = AuditStore.objects.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])

        audit_conducted = audit_stores.count()
        revenue = audit_conducted * audit_cycle.charge_per_audit + audit_cycle.system_cost

        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client_id'] = audit_cycle.client.id
        obj['client'] = audit_cycle.client.name
        obj['month'] = audit_cycle.start_date.month
        obj['year'] = audit_cycle.start_date.year
        obj['system_cost'] = audit_cycle.system_cost
        obj['charge_per_audit'] = audit_cycle.charge_per_audit
        obj['audit_conducted'] = audit_conducted
        obj['revenue'] = revenue
        obj['gst'] = revenue * 0.18
        obj['est_billing'] = (audit_cycle.planned_audit * audit_cycle.charge_per_audit) + audit_cycle.system_cost
        response.append(obj)

    return response


def get_profitability_report(month, year, client):
    if client:
        query = Q(client = client)
    else:
        query = Q()

    if month and year:
        audit_cycles = AuditCycle.objects.filter(query, start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(query, start_date__year = year).order_by('end_date').select_related('client')

    response = []
    for audit_cycle in audit_cycles:
        obj = {}

        audit_stores = AuditStore.objects.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])

        audit_conducted = audit_stores.count()
        revenue = audit_conducted * audit_cycle.charge_per_audit + audit_cycle.system_cost
        auditor_cost = audit_stores.aggregate(cost = Sum(F('earnings_per_audit')))
        auditor_cost = auditor_cost['cost'] if auditor_cost['cost'] else 0
        ops_profitability = revenue - auditor_cost

        cycle_earnings_per_audit = audit_cycle.earnings_per_audit if audit_cycle.earnings_per_audit else 0

        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client_id'] = audit_cycle.client.id
        obj['client'] = audit_cycle.client.name
        obj['month'] = audit_cycle.start_date.month
        obj['year'] = audit_cycle.start_date.year
        obj['audit_conducted'] = audit_conducted
        obj['charge_per_audit'] = audit_cycle.charge_per_audit
        obj['system_cost'] = audit_cycle.system_cost
        obj['revenue'] = revenue
        obj['auditor_cost'] = auditor_cost
        obj['ops_profitability'] = ops_profitability
        obj['est_profitability'] = ((audit_cycle.planned_audit * audit_cycle.charge_per_audit) + audit_cycle.system_cost) - (audit_cycle.planned_audit * cycle_earnings_per_audit)
        response.append(obj)

    return response

def get_qa_wise_report_pannel(client=None, audit_cycle_id=None, day=None,month=None, year=None,qa=None):
    if not year:
        raise ValueError("The 'year' parameter is required.")
    
    try:
        year = int(year)
        month = int(month) if month else None
        day = int(day) if day else None
    except ValueError:
        raise ValueError("Invalid 'year/month/day' — must be integers.")

    client = int(client) if client else None
    audit_cycle_id = int(audit_cycle_id) if audit_cycle_id else None
    qa = int(qa) if qa else None

    response = {
        "audit_store_data": [],
        "client_list": [],
        "audit_cycle_list": []
    }

    VALID_STATUSES = [AuditStore.PM_REVIEW, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.FAILED, AuditStore.REJECTED]

    store_filter = {
        'status__in': VALID_STATUSES,
        'audit_date__year': year,
    }
    if month:
        store_filter['audit_date__month'] = month
    if day:
        store_filter['audit_date__day'] = day
    audit_stores_qs = AuditStore.objects.filter(**store_filter)
    valid_cycle_ids = audit_stores_qs.values_list('audit__audit_cycle_id', flat=True).distinct()

    base_cycles = AuditCycle.objects.select_related('client').filter(
        id__in=valid_cycle_ids
    ).order_by("client__id", "id")

    if not base_cycles.exists():
        return response

    client_set = set()
    client_list = []
    for cycle in base_cycles:
        if cycle.client.id not in client_set:
            client_set.add(cycle.client.id)
            client_list.append({
                "id": cycle.client.id,
                "name": cycle.client.name
            })
    response["client_list"] = client_list

    if not client:
        client = base_cycles.first().client.id

    selected_cycles = base_cycles.filter(client_id=client)
    if not selected_cycles.exists():
        return response

    audit_cycle_list = [
        {
            "id": c.id,
            "name": c.name,
            "client_name": c.client.name,
            "client_id": c.client.id
        } for c in selected_cycles
    ]
    response["audit_cycle_list"] = audit_cycle_list

    if not audit_cycle_id:
        audit_cycle_id = selected_cycles.first().id
    try:
        selected_cycle = selected_cycles.get(id=audit_cycle_id)
    except AuditCycle.DoesNotExist:
        return response

    # Final audit_store filter: only with required cycle and statuses
    # final_store_filter = {
    #     'audit__audit_cycle_id': selected_cycle.id,
    #     'status__in': [AuditStore.COMPLETED, AuditStore.ACCEPTED],
    # }
    # if month:
    #     final_store_filter['audit__audit_cycle__start_date__month'] = month
    # if day:
    #     final_store_filter['audit__audit_cycle__start_date__day'] = day


    final_store_filter = {
        'audit__audit_cycle_id': selected_cycle.id,
        'status__in': [AuditStore.COMPLETED, AuditStore.ACCEPTED,AuditStore.PM_REVIEW],
        'audit_date__year': year,
    }
    if month:
        final_store_filter['audit_date__month'] = month
    if day:
        final_store_filter['audit_date__day'] = day

    audit_stores = AuditStore.objects.filter(**final_store_filter)
    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

    if qa:
        try:
            mod_user = User.objects.get(id=qa, is_active=True)
        except User.DoesNotExist:
            raise Exception("Disabled or invalid QA cannot be assigned reports")

        audit_store_ids = audit_stores.values_list("id", flat=True)
        perm_store_ids = UserObjectPermission.objects.filter( content_type=content_type, permission=permission, user_id=qa, object_pk__in=map(str, audit_store_ids) ).values_list("object_pk", flat=True)

        audit_stores = audit_stores.filter(id__in=list(map(int, perm_store_ids)))
        for store in audit_stores:
            if not UserObjectPermission.objects.filter(
                user=mod_user,
                content_type=content_type,
                permission=permission,
                object_pk=str(store.id)
            ).exists():
                assign_perm('moderator_manage', mod_user, store)

    for store in audit_stores:
        if qa:
            user = User.objects.filter(id=qa).first()
            qa_email = user.email if user else ""
        else:
            perm = UserObjectPermission.objects.filter( content_type=content_type, permission=permission, object_pk=str(store.id), user__is_active=True ).select_related('user').first()
            qa_email = perm.user.email if perm and perm.user else ""

        response["audit_store_data"].append({
            "audit_cycle_id": selected_cycle.id,
            "audit_cycle_name": selected_cycle.name,
            "audit_cycle_status": selected_cycle.status,
            "client_id": selected_cycle.client.id,
            "client": selected_cycle.client.name,
            "month": selected_cycle.start_date.month,
            "year": selected_cycle.start_date.year,
            "audit_store_id": store.id,
            "audit_store_status": store.status,
            "audit_date": store.audit_date,
            "report_submission_time": store.report_submission_time,
            "moderator_submission_time": store.moderator_submission_time,
            "qa_rating": store.qa_rating,
            "user_id": store.user_id,
            "submit_at": store.submit_at,
            "qa_email": qa_email,
        })

    return response

from datetime import datetime, timedelta

def get_date_range(day=None, month=None, year=None):
    if not year:
        raise ValueError("Year is required")
    if month:
        if day:
            start_date = datetime(year, month, day)
            end_date = start_date + timedelta(days=1)
        else:
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
    else:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)
    return start_date, end_date

def get_qa_wise_report_performance(raw_day, raw_month, raw_year, raw_qa):
    day = int(raw_day) if raw_day and raw_day.strip() else None
    month = int(raw_month) if raw_month and raw_month.strip() else None
    year = int(raw_year) if raw_year and raw_year.strip() else None
    qa = int(raw_qa) if raw_qa and raw_qa.strip() else None

    start_date, end_date = get_date_range(day=day, month=month, year=year)

    if not year:
        raise ValueError("Year is required")
    response = {
        "audit_store_data": []
    }

    audit_stores = AuditStore.objects.filter(
        status__in=[AuditStore.COMPLETED,AuditStore.ACCEPTED,AuditStore.PM_REVIEW,AuditStore.FAILED,AuditStore.REJECTED,]
    ).prefetch_related(
        Prefetch(
            "audit_store_status_log",queryset=ReportStatusLog.objects.order_by("created_at")
        )
    )

    filtered_audit_stores = []

    for audit in audit_stores:
        report_date = get_report_count_date(audit)

        if not report_date:
            continue

        if start_date.date() <= report_date.date() < end_date.date():
            filtered_audit_stores.append((audit, report_date))

    audit_stores = filtered_audit_stores
    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get( content_type=content_type,codename="moderator_manage")

    perms_all = UserObjectPermission.objects.filter(content_type=content_type,permission=permission,user__is_active=True)
    if qa:
        perms_qs = perms_all.filter(user_id=qa)
    else:
        perms_qs = perms_all

    store_perm_map = defaultdict(set)
    store_ids = [str(store.id) for store, _ in audit_stores]

    for perm in perms_qs.filter(object_pk__in=store_ids):
        store_perm_map[int(perm.object_pk)].add(perm.user_id)

    user_info = {
        u["user_id"]: u["user__email"]
        for u in perms_qs.order_by("user_id")
        .distinct("user_id")
        .values("user_id", "user__email")
    }

    audit_count_by_user = defaultdict(int)
    for _, user_ids in store_perm_map.items():
        for uid in user_ids:
            audit_count_by_user[uid] += 1

    for store, report_date in audit_stores:
        if store.id not in store_perm_map:
            continue

        for qa_id in store_perm_map[store.id]:
            response["audit_store_data"].append({
                "audit_store_id": store.id,
                "moderator_submission_date": report_date,
                "audit_status": store.status,
                "report_submission_time": store.report_submission_time,
                "moderator_submission_time": store.moderator_submission_time,
                "qa_rating": store.qa_rating,
                "user_id": store.user_id,
                "qa_email": user_info.get(qa_id),
                "qa_id": qa_id,
                "year": report_date.year,
                "month": report_date.month,
                "day": report_date.day,
                "audit_count": audit_count_by_user[qa_id],
            })

    return response

def get_project_cost_report(month, year, client):
    if client:
        query = Q(client = client)
    else:
        query = Q()

    if month and year:
        audit_cycles = AuditCycle.objects.filter(query, start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(query, start_date__year = year).order_by('end_date').select_related('client')

    audit_stores = AuditStore.objects.filter(audit__audit_cycle__id__in = audit_cycles)

    response = []
    for audit_cycle in audit_cycles:
        obj = {}

        audit_stores1 = audit_stores.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])
        audit_conducted = audit_stores1.count()
        planned_audit = audit_cycle.planned_audit
        auditor_cost = audit_stores1.aggregate(cost = Sum(F('earnings_per_audit')))
        auditor_cost = auditor_cost['cost'] if auditor_cost['cost'] else 0

        audit_stores2 = audit_stores.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.COMPLETED, AuditStore.ACCEPTED])
        budget_utilized = audit_stores2.aggregate(cost = Sum(F('earnings_per_audit')))
        budget_utilized = budget_utilized['cost'] if budget_utilized['cost'] else 0

        cycle_earnings_per_audit = audit_cycle.earnings_per_audit if audit_cycle.earnings_per_audit else 0
        estimated_cost = cycle_earnings_per_audit * planned_audit

        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client_id'] = audit_cycle.client.id
        obj['client'] = audit_cycle.client.name
        obj['month'] = audit_cycle.start_date.month
        obj['year'] = audit_cycle.start_date.year
        obj['planned_audit'] = planned_audit
        obj['conducted_audit'] = audit_conducted
        obj['audit_complete_per'] = round((audit_conducted / planned_audit) * 100, 1) if planned_audit > 0 else 0
        obj['estimated_cost'] = estimated_cost
        obj['actual_cost'] = auditor_cost
        obj['budget_utilized'] = budget_utilized
        obj['variation'] = estimated_cost - auditor_cost
        response.append(obj)

    return response


def get_monthly_pnl_report(year):

    audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date')
    audit_stores = AuditStore.objects.filter(audit__audit_cycle__id__in = audit_cycles, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])

    response = []
    month_list = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    for i in month_list:
        obj = {}
        filtered_audit_cycle = audit_cycles.filter(start_date__month = i)

        revenue, total_reimbursement, total_earnings_per_audit = 0, 0, 0

        for j in filtered_audit_cycle:
            filtered_audit_stores = audit_stores.filter(audit__audit_cycle__id = j.id)
            audit_conducted = filtered_audit_stores.count()
            audit_conducted_count = audit_conducted if audit_conducted else 0
            revenue += ((audit_conducted_count * j.charge_per_audit) + j.system_cost)

            audit_price = filtered_audit_stores.aggregate(reim_sum = Sum('reimbursement'), ear_sum = Sum('earnings_per_audit'))
            total_reimbursement += audit_price['reim_sum'] if audit_price['reim_sum'] else 0
            total_earnings_per_audit += audit_price['ear_sum'] if audit_price['ear_sum'] else 0

        auditor_payment = total_reimbursement + total_earnings_per_audit
        gross_margin = revenue - auditor_payment
        obj['month'] = i
        obj['year'] = year
        obj['sales'] = revenue
        obj['auditor_payment'] = auditor_payment
        obj['gross_margin'] = gross_margin
        obj['gross_margin_per'] = round(((revenue - auditor_payment) / revenue) * 100, 1) if revenue > 1 else 0
        response.append(obj)

    return response


def get_manager_wise_profitability_report(month, year, manager):
    response = []
    if month:
        month_list = [month]
    else:
        month_list = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    if manager:
        filtered_manager_list = Group.objects.get(name=GROUP_NAME_MANAGER).user_set.filter(pk=manager, is_active = True).only('id', 'email')
    else:
        filtered_manager_list = Group.objects.get(name=GROUP_NAME_MANAGER).user_set.filter(is_active = True).only('id', 'email')

    manager_list = Group.objects.get(name=GROUP_NAME_MANAGER).user_set.filter(is_active = True).only('id', 'email')
    active_managers = [manager.id for manager in manager_list]
    audit_cycles = AuditCycle.objects.filter(client__managers__user__id__in = active_managers, client__managers__is_active = True, start_date__year = year).order_by('id').distinct('id')
    audit_cycle_list = audit_cycles.values_list('id', flat=True)
    audit_stores = AuditStore.objects.filter(audit__audit_cycle__in = audit_cycle_list, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED], audit_date__year = year)
    cycles_with_manager_count = AuditCycle.objects.filter(client__managers__user__id__in = active_managers, client__managers__is_active = True, start_date__year = year).values('id').annotate(manager_count = Count('client__managers__is_active'))

    for month in month_list:

        monthly_auditor_cost = 0
        total_monthly_revenue = 0
        total_monthly_audit_count = 0
        monthly_filtered_audit_cycle = audit_cycles.filter(start_date__month = month)
        for cycle in monthly_filtered_audit_cycle:
            audit_count = audit_stores.filter(audit__audit_cycle = cycle.id).count()
            manager_count = cycles_with_manager_count.filter(id = cycle.id, manager_count__gt = 0).first()
            if manager_count:
                audit_count = round(audit_count / manager_count['manager_count'],1)
            total_monthly_audit_count += audit_count
            total_monthly_revenue += (cycle.charge_per_audit * audit_count) + cycle.system_cost

        monthly_audit_store = audit_stores.filter(audit__audit_cycle__in = monthly_filtered_audit_cycle)

        for store in monthly_audit_store:
            monthly_auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

        monthly_ops_profitability = total_monthly_revenue - monthly_auditor_cost


        for manager in filtered_manager_list:
            auditor_cost = 0
            total_revenue = 0
            total_audit_count = 0
            total_planned_audit = 0

            filtered_audit_cycle = audit_cycles.filter(client__managers__user__id = manager.id, client__managers__is_active = True, start_date__month = month)

            for cycle in filtered_audit_cycle:
                audit_count = audit_stores.filter(audit__audit_cycle = cycle.id).count()
                planned_audit = cycle.planned_audit
                manager_count = cycles_with_manager_count.filter(id = cycle.id, manager_count__gt = 0).first()
                if manager_count:
                    planned_audit = round(planned_audit / manager_count['manager_count'], 1)
                    audit_count = round(audit_count / manager_count['manager_count'],1)
                total_planned_audit += planned_audit
                total_audit_count += audit_count
                total_revenue += (cycle.charge_per_audit * audit_count) + cycle.system_cost

            filtered_audit_store = audit_stores.filter(audit__audit_cycle__in = filtered_audit_cycle)

            for store in filtered_audit_store:
                auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

            ops_profitability = round(total_revenue - auditor_cost, 1)

            if monthly_ops_profitability == 0:
                profitability_per = 0
            else:
                profitability_per = round((ops_profitability / monthly_ops_profitability) * 100, 1)

            if total_monthly_audit_count == 0:
                audit_count_per = 0
            else:
                audit_count_per = round((total_audit_count / total_monthly_audit_count) * 100, 1)

            response.append({
                "manager_id": manager.id,
                "manager_email": manager.email,
                "month": month,
                "year": year,
                "planned_audit": total_planned_audit,
                "audit_count": round(total_audit_count,1),
                "revenue": total_revenue,
                "profitability": ops_profitability,
                "profitability_per": profitability_per,
                "audit_count_per": audit_count_per,
            })
    return response


def get_client_wise_profitability_report(client, year, last_client_id):
    total_client_count = 0
    if client:
        client_list = Client.objects.filter(id = client, is_active=True).order_by('-id')
    else:
        client_list = Client.objects.filter(is_active=True).order_by('-id')

    total_client_count = client_list.count()

    if last_client_id !="":
        client_list = client_list.filter(id__gt = last_client_id)

    # client_list = client_list[:50]
    response = []
    month_list = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    audit_cycles = AuditCycle.objects.filter(client__in = client_list, start_date__year = year).order_by('end_date')
    audit_stores = AuditStore.objects.filter(audit_date__year = year, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])
    for client in client_list:
        client_data = []
        total_ops_profitability = 0

        for month in month_list:
            auditor_cost = 0
            revenue = 0
            ops_profitability = 0

            filtered_audit_cycle = audit_cycles.filter(client = client.id, start_date__month = month)
            for cycle in filtered_audit_cycle:  
                # audit_count = audit_stores.filter(audit__audit_cycle = cycle.id, audit_date__month = month).count()
                audit_count = audit_stores.filter(audit__audit_cycle = cycle.id, audit__audit_cycle__start_date__month = month).count()
                revenue += ((cycle.charge_per_audit * audit_count) + cycle.system_cost)

                # if cycle.id == 1886:
                #     _logger.info("Cycle ID: %s", cycle.id)
                #     _logger.info("Audit Count (in cycle): %s", audit_count)
                #     _logger.info("Audit Count (in cycle): %s", cycle.charge_per_audit)
                #     _logger.info("Revenue (in cycle): %s", revenue)

            # filtered_audit_store = audit_stores.filter(audit__audit_cycle__in = filtered_audit_cycle, audit_date__month = month)
            filtered_audit_store = audit_stores.filter(audit__audit_cycle__in = filtered_audit_cycle, audit__audit_cycle__start_date__month = month)
            for store in filtered_audit_store:
                auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

            ops_profitability = revenue - auditor_cost
            total_ops_profitability += ops_profitability

            # if any(cycle.id == 1886 for cycle in filtered_audit_cycle):
            #     _logger.info("Month: %s", month)
            #     _logger.info("Total Revenue: %s", revenue)
            #     _logger.info("Total Auditor Cost: %s", auditor_cost)
            #     _logger.info("Ops Profitability: %s", ops_profitability)
            client_data.append({
                "month": month,
                "profit": ops_profitability
            })
        # if client_data:
        #     response.append({
        #         "client": {
        #             "id": client.id,
        #             "name": client.name,
        #         },
        #         "month_list": client_data,
        #         "total_profit": total_ops_profitability
        #     })
        if total_ops_profitability > 0:
            response.append({
                "client": {
                    "id": client.id,
                    "name": client.name,
                },
                "month_list": client_data,
                "total_profit": total_ops_profitability
            })
    return {'client_list': response, 'total_client_count': total_client_count}


def get_qa_wise_report(month, year, qa):
    response = []
    month_list = (
        [month]
        if month
        else ["01", "02", "03", "04", "05", "06","07", "08", "09", "10", "11", "12"]
    )
    year = int(year)

    audit_stores = (
        AuditStore.objects.filter(
            status__in=[AuditStore.COMPLETED,AuditStore.ACCEPTED,AuditStore.PM_REVIEW,AuditStore.FAILED,AuditStore.REJECTED,]
        )
        .only("id","status","moderator_submission_date",
        )
        .prefetch_related(
            Prefetch(
                "audit_store_status_log",queryset=ReportStatusLog.objects.only(
                    "audit_store_id", "status","created_at",).order_by("created_at"),
            ))
    )
    reports_by_month = defaultdict(list)
    audit_month = {}
    for audit in audit_stores:
        report_date = get_report_count_date(audit)
        if report_date and report_date.year == year:
            month_key = str(report_date.month).zfill(2)
            audit_id = str(audit.id)
            reports_by_month[month_key].append(audit_id)
            audit_month[audit_id] = month_key

    if not audit_month:
        return []

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type,codename="moderator_manage",)

    perms = UserObjectPermission.objects.filter(content_type=content_type,permission=permission,user__is_active=True,object_pk__in=audit_month.keys(),)

    if qa:
        perms = perms.filter(user_id=qa)

    user_list = list(perms.values("user_id", "user__email").distinct().order_by("user_id"))
    qa_month_count = defaultdict(int)
    for row in perms.values("user_id", "object_pk").distinct():
        month_key = audit_month.get(row["object_pk"])
        if month_key:
            qa_month_count[(month_key, row["user_id"])] += 1

    for month in month_list:
        total_reports = len(reports_by_month.get(month, []))
        if total_reports == 0:
            continue

        days = monthrange(year, int(month))[1]
        for user in user_list:
            audit_count = qa_month_count.get((month, user["user_id"]),0,)
            response.append(
                {
                    "month": month,
                    "qa_email": user["user__email"],
                    "year": str(year),
                    "audit_count": audit_count,
                    "report_per": round((audit_count / total_reports) * 100,1,),
                    "report_per_day": round(audit_count / days,1,),
                }
            )

    return response

# def get_qa_wise_report(month, year, qa):
#     response = []
#     if month:
#         month_list = [month]
#     else:
#         month_list = ["01","02","03","04","05","06","07","08","09","10","11","12"]

#     # audit_stores = AuditStore.objects.filter(status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.PM_REVIEW, AuditStore.FAILED, AuditStore.REJECTED, AuditStore.ACKNOWLEDGED])

#     audit_stores = AuditStore.objects.filter(
#         status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.PM_REVIEW, AuditStore.FAILED, AuditStore.REJECTED, AuditStore.ACKNOWLEDGED],
#         moderator_submission_date__isnull=False,
#         moderator_submission_date__year=year
#     )
#     content_type = ContentType.objects.get_for_model(AuditStore)
#     permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

#     perms_for_month = UserObjectPermission.objects.filter(content_type=content_type, permission=permission, user__is_active=True)
#     if qa:
#         perms = UserObjectPermission.objects.filter(content_type=content_type, permission=permission, user__is_active=True, user_id = qa)
#     else:
#         perms = UserObjectPermission.objects.filter(content_type=content_type, permission=permission, user__is_active=True)
#     user_list = perms.order_by('user_id').distinct('user_id').values('user_id', 'user__email')
#     for month in month_list:

#         # reports = audit_stores.filter(audit_date__month=month, audit_date__year = year).values_list("id", flat=True)
#         reports = audit_stores.filter(moderator_submission_date__month=month, moderator_submission_date__year = year).values_list("id", flat=True).distinct()
#         if reports:
#             report_ids = [str(report) for report in reports]

#             filtered_perms = perms.filter(object_pk__in=report_ids)
#             # monthly_count = perms_for_month.filter(object_pk__in=report_ids).count()
#             monthly_count = len(report_ids)

#             for user in user_list:

#                 audit_count = filtered_perms.filter(user_id = user['user_id']).values('object_pk').distinct().count()
#                 if monthly_count == 0:
#                     report_per = 0
#                 else:
#                     report_per = round((audit_count / monthly_count) * 100, 1)
#                 report_per_day = round(audit_count / monthrange(int(year), int(month))[1], 1)
#                 data = {
#                     'month': month,
#                     'qa_email': user['user__email'],
#                     'year': year,
#                     'audit_count': audit_count,
#                     'report_per': report_per,
#                     'report_per_day': report_per_day
#                 }
#                 response.append(data)
#     return response


def get_follow_up_report(client: int, cycle: int, store: int, audit_status: str, followup_date: str, auto_assigned: str):

    audit_stores = AuditStore.objects.select_related('audit__audit_cycle__client', 'audit__audit_cycle', 'audit__store', 'user').prefetch_related('user__profileinfo').order_by('audit__store__name')

    if client:
        audit_stores = audit_stores.filter(audit__audit_cycle__client = client)
    if cycle:
        audit_stores = audit_stores.filter(audit__audit_cycle = cycle)
    if store:
        audit_stores = audit_stores.filter(audit = store)
    if audit_status:
        audit_stores = audit_stores.filter(status = audit_status)
    if followup_date:
        audit_stores = audit_stores.filter(follow_up__next_follow_up_date__date = followup_date)
    if auto_assigned == 'yes':
        audit_stores = audit_stores.filter(auto_assigned = True)
    elif auto_assigned == 'no':
        audit_stores = audit_stores.filter(auto_assigned = False)

    result = []
    for store in audit_stores:
        try:
            profile_info = store.user.profileinfo
        except ProfileInfo.DoesNotExist as e:
            profile_info = None

        if profile_info:
            full_name = '{} {}'.format(profile_info.first_name, profile_info.last_name)
            mobile_number = profile_info.mobile_number
        else:
            full_name = ''
            mobile_number = ''

        follow_up = store.follow_up.first()
        if follow_up:
            follow_up_dict = {
                'id': follow_up.id,
                'comment': follow_up.comment,
                'user': follow_up.user_actor.email,
                'next_follow_up_date': follow_up.next_follow_up_date
            }
        else:
            follow_up_dict = {
                'id': '',
                'comment': '',
                'user': '',
                'next_follow_up_date': ''
            }
        result.append({
            'client':{
                'id': store.audit.audit_cycle.client.id,
                'name': store.audit.audit_cycle.client.name
            },
            'audit_cycle':{
                'id': store.audit.audit_cycle.id,
                'name': store.audit.audit_cycle.name,
            },
            'store':{
                'id': store.audit.store.id,
                'name': store.audit.store.name
            },
            'auditStore':{
                'id': store.id,
                'audit_date': store.audit_date,
                'status': store.status
            },
            'user':{
                'id': store.user.id,
                'name': full_name,
                'mobile_number': mobile_number
            },
            'follow_up': follow_up_dict
        })
    return result