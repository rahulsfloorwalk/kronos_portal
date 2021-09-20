from payment.models import Payment
from audit.models import AuditCycle
from audit_store.models import AuditStore
from django.db.models import Sum, F
from django.conf import settings
from kronos.exceptions import AppLogicError

def get_auditor_payment_report(month, year, payment_type, user):
    if user.email not in settings.REPORT_PERMISSION_EMAIL_LIST:
        raise AppLogicError("Permission denied")

    if month and year:
        audit_cycles = AuditCycle.objects.filter(start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date').select_related('client')

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


def get_billing_report(month, year, user):
    if user.email not in settings.REPORT_PERMISSION_EMAIL_LIST:
        raise AppLogicError("Permission denied")

    if month and year:
        audit_cycles = AuditCycle.objects.filter(start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date').select_related('client')

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


def get_profitability_report(month, year, user):
    if user.email not in settings.REPORT_PERMISSION_EMAIL_LIST:
        raise AppLogicError("Permission denied")

    if month and year:
        audit_cycles = AuditCycle.objects.filter(start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date').select_related('client')

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


def get_project_cost_report(month, year, user):
    if user.email not in settings.REPORT_PERMISSION_EMAIL_LIST:
        raise AppLogicError("Permission denied")

    if month and year:
        audit_cycles = AuditCycle.objects.filter(start_date__month = month, start_date__year = year).order_by('end_date').select_related('client')
    else:
        audit_cycles = AuditCycle.objects.filter(start_date__year = year).order_by('end_date').select_related('client')

    response = []
    for audit_cycle in audit_cycles:
        obj = {}

        audit_stores = AuditStore.objects.filter(audit__audit_cycle__id = audit_cycle.id, status__in = [AuditStore.COMPLETED, AuditStore.ACCEPTED])
        audit_conducted = audit_stores.count()
        planned_audit = audit_cycle.audit_count()
        planned_audit = planned_audit if planned_audit else 0
        auditor_cost = audit_stores.aggregate(cost = Sum(F('earnings_per_audit')))
        auditor_cost = auditor_cost['cost'] if auditor_cost['cost'] else 0
        cycle_earnings_per_audit = audit_cycle.earnings_per_audit if audit_cycle.earnings_per_audit else 0
        estimated_cost = cycle_earnings_per_audit * planned_audit

        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client'] = audit_cycle.client.name
        obj['month'] = audit_cycle.start_date.month
        obj['year'] = audit_cycle.start_date.year
        obj['planned_audit'] = planned_audit
        obj['conducted_audit'] = audit_conducted
        obj['audit_complete_per'] = round((audit_conducted / planned_audit) * 100, 1) if planned_audit > 0 else 0
        obj['estimated_cost'] = estimated_cost
        obj['actual_cost'] = auditor_cost
        obj['variation'] = estimated_cost - auditor_cost
        response.append(obj)

    return response