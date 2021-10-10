from payment.models import Payment
from audit.models import AuditCycle
from audit_store.models import AuditStore
from django.db.models import Sum, F, Q
from client.models import Client, ClientManager

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

        payment_count = Payment.objects.filter(audit_store_id__in = audit_stores, status = Payment.PAID).count()

        audit_count = audit_stores.count()

        audit_price = audit_stores.aggregate(reim_sum = Sum('reimbursement'), ear_sum = Sum('earnings_per_audit'))

        if audit_count == payment_count:
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

        planned_audit = audit_cycle.audit_count()
        planned_audit = planned_audit if planned_audit else 0

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
        obj['est_auditor_payment'] = planned_audit * (cycle_earnings_per_audit + cycle_reimbursement)
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

        planned_audit = audit_cycle.audit_count()
        planned_audit = planned_audit if planned_audit else 0

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
        obj['est_billing'] = (planned_audit * audit_cycle.charge_per_audit) + audit_cycle.system_cost
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

        planned_audit = audit_cycle.audit_count()
        planned_audit = planned_audit if planned_audit else 0

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
        obj['est_profitability'] = ((planned_audit * audit_cycle.charge_per_audit) + audit_cycle.system_cost) - (planned_audit * cycle_earnings_per_audit)
        response.append(obj)

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
        planned_audit = audit_cycle.audit_count()
        planned_audit = planned_audit if planned_audit else 0
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
        manager_list = ClientManager.objects.select_related('user').filter(user = manager, is_active = True)
    else:
        manager_list = ClientManager.objects.select_related('user').filter(is_active = True)
    audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date')
    audit_stores = AuditStore.objects.filter(status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED], audit_date__year = year)

    for month in month_list:

        monthly_auditor_cost = 0
        total_monthly_revenue = 0
        total_monthly_audit_count = 0
        monthly_audit_count = audit_stores.filter(audit_date__month = month).count()
        for cycle in audit_cycles:
            audit_count = audit_stores.filter(audit__audit_cycle = cycle.id, audit_date__month = month).count()
            total_monthly_audit_count += audit_count
            total_monthly_revenue += ((cycle.charge_per_audit * audit_count) + cycle.system_cost)

        monthly_audit_store = audit_stores.filter(audit_date__month = month, audit_date__year = year)

        for store in monthly_audit_store:
            monthly_auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

        monthly_ops_profitability = total_monthly_revenue - monthly_auditor_cost


        for manager in manager_list:
            auditor_cost = 0
            total_revenue = 0
            total_audit_count = 0

            filtered_audit_cycle = audit_cycles.filter(client__managers__id = manager.id)

            for cycle in filtered_audit_cycle:
                audit_count = audit_stores.filter(audit__audit_cycle = cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED], audit_date__month = month).count()
                total_audit_count += audit_count
                total_revenue += ((cycle.charge_per_audit * audit_count) + cycle.system_cost)

            filtered_audit_store = audit_stores.filter(audit__audit_cycle__client__managers__id = manager.id, audit_date__month = month, audit_date__year = year)

            for store in filtered_audit_store:
                auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

            ops_profitability = total_revenue - auditor_cost

            if monthly_ops_profitability == 0:
                profitability_per = 0
            else:
                profitability_per = round((ops_profitability / monthly_ops_profitability) * 100, 1)

            if monthly_audit_count == 0:
                audit_count_per = 0
            else:
                audit_count_per = round((total_audit_count / monthly_audit_count) * 100, 1)

            response.append({
                "manager_id": manager.id,
                "manager_email": manager.user.email,
                "month": month,
                "year": year,
                "audit_count": total_audit_count,
                "revenue": total_revenue,
                "profitability": ops_profitability,
                "profitability_per": profitability_per,
                "audit_count_per": audit_count_per,
            })
    return response


def get_client_wise_profitability_report(client, year):
    if client:
        client_list = Client.objects.filter(id = client)
    else:
        client_list = Client.objects.all()
    response = []
    month_list = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    audit_cycles = AuditCycle.objects.filter(client__in = client_list, start_date__year = year).order_by('end_date')
    audit_stores = AuditStore.objects.filter(audit__audit_cycle__client__in = client_list, audit_date__year = year, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])
    for client in client_list:
        client_data = []
        total_ops_profitability = 0
        filtered_audit_cycle = audit_cycles.filter(client = client.id)

        for month in month_list:
            auditor_cost = 0
            revenue = 0

            for cycle in filtered_audit_cycle:
                audit_count = audit_stores.filter(audit__audit_cycle = cycle.id, audit_date__month = month).count()
                revenue += ((cycle.charge_per_audit * audit_count) + cycle.system_cost)

            filtered_audit_store = audit_stores.filter(audit__audit_cycle__client = client.id, audit_date__month = month)
            for store in filtered_audit_store:
                auditor_cost += store.earnings_per_audit if store.earnings_per_audit else 0

            ops_profitability = revenue - auditor_cost
            total_ops_profitability += ops_profitability
            client_data.append({
                "month": month,
                "profit": ops_profitability
            })
        if client_data:
            response.append({
                "client": {
                    "id": client.id,
                    "name": client.name,
                },
                "month_list": client_data,
                "total_profit": total_ops_profitability
            })
    return response