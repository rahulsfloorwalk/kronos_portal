from kronos.celery import app
from audit_store.service import find_7_days_assigned_reports, find_10_days_in_progress_reports
from notify.service.send_mail_system_fail_withdraw_reports import send_audit_report_failed_withdraw_email
from client.service.client_manager import get_manager_email_list_by_audit_store_obj
from audit_store.models import AuditStore


@app.task(ignore_result=True)
def fail_withdraw_audit_stores():
    assigned_reports = find_7_days_assigned_reports()
    in_progress_reports = find_10_days_in_progress_reports()
    for assign_report in assigned_reports:
        email_list = get_manager_email_list_by_audit_store_obj(assign_report)
        if email_list:
            emails = email_list
        else:
            emails = ["shubham.mohod@floorwalk.in"]
        for email in emails:
            send_audit_report_failed_withdraw_email.delay(email, assign_report.id, "withdraw", "manager")
        send_audit_report_failed_withdraw_email.delay(assign_report.user.email, assign_report.id, "withdraw", "auditor")
        assign_report.status = AuditStore.WITHDRAWN
        assign_report.save()
    for in_progress_report in in_progress_reports:
        email_list = get_manager_email_list_by_audit_store_obj(in_progress_report)
        if email_list:
            emails = email_list
        else:
            emails = ["shubham.mohod@floorwalk.in"]
        for email in emails:
            send_audit_report_failed_withdraw_email.delay(email, in_progress_report.id, "fail", "manager")
        send_audit_report_failed_withdraw_email.delay(in_progress_report.user.email, in_progress_report.id, "fail",
                                                      "auditor")
        in_progress_report.status = AuditStore.FAILED
        in_progress_report.save()
        return len(assigned_reports)
