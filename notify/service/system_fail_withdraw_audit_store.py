from kronos.celery import app
from audit_store.service import find_7_days_assigned_reports, find_10_days_in_progress_reports, find_2_days_not_submitted_reports
from notify.service.send_mail_system_fail_withdraw_reports import send_audit_report_failed_withdraw_email, send_audit_report_failed_email_for_auto_align
# from client.service.client_manager import get_manager_email_list_by_audit_store_obj
from audit_store.models import AuditStore
from auditor.service.auditor_api import get_report_completion_percentage


@app.task(ignore_result=True)
def fail_withdraw_audit_stores():
    assigned_reports = find_7_days_assigned_reports()
    in_progress_reports = find_10_days_in_progress_reports()
    for assign_report in assigned_reports:
        # email_list = get_manager_email_list_by_audit_store_obj(assign_report)
        # if email_list:
        #     emails = email_list
        # else:
        #     emails = ["shubham.mohod@floorwalk.in"]
        # for email in emails:
        #     send_audit_report_failed_withdraw_email.delay(email, assign_report.id, "withdraw", "manager")
        send_audit_report_failed_withdraw_email.delay(assign_report.user.email, assign_report.id, "withdraw", "auditor")
        assign_report.status = AuditStore.WITHDRAWN
        assign_report.save()
    for in_progress_report in in_progress_reports:
        # email_list = get_manager_email_list_by_audit_store_obj(in_progress_report)
        # if email_list:
        #     emails = email_list
        # else:
        #     emails = ["shubham.mohod@floorwalk.in"]
        # for email in emails:
        #     send_audit_report_failed_withdraw_email.delay(email, in_progress_report.id, "fail", "manager")
        send_audit_report_failed_withdraw_email.delay(in_progress_report.user.email, in_progress_report.id, "fail",
                                                      "auditor")
        in_progress_report.status = AuditStore.FAILED
        in_progress_report.failed_by = AuditStore.SYSTEM
        in_progress_report.save()
        return len(assigned_reports)


@app.task(ignore_result=True)
def fail_audit_stores_of_auto_align():

    not_submitted_reports = find_2_days_not_submitted_reports()
    filtered_non_submitted_reports = not_submitted_reports.filter(audit__audit_cycle__audit_auto_approve = True)
    for not_submitted_report in filtered_non_submitted_reports:
        try:
            percentage = get_report_completion_percentage(not_submitted_report.id)
            if percentage is None:
                continue
            AuditStore.objects.filter(id=not_submitted_report.id).update(report_completion_percentage=percentage)
        except Exception:
            continue

        if percentage is not None and percentage > 20:
            continue
        send_audit_report_failed_email_for_auto_align.delay(not_submitted_report.user.email, not_submitted_report.id, "fail", "auditor")
        not_submitted_report.status = AuditStore.FAILED
        not_submitted_report.failed_by = AuditStore.SYSTEM
        not_submitted_report.save()