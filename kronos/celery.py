from __future__ import absolute_import
import os

from celery import Celery
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kronos.settings")

app = Celery(__name__)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):

    from notify.service.mail_reminders import send_pre_audit_reminders, send_on_audit_reminders
    from notify.service.mail_notify_client import send_mail_to_client
    from notify.service.reporting_stats_mail_notify import reporting_stats_send_mail
    # from notify.service.mail_reminders import send_pre_audit_reminders, send_on_audit_reminders, send_post_audit_reminders
    from notify.service.alert_faulty_report import find_faulty_report
    # from attachment.save_audio_transcription import save_audio_transcription
    from notify.service.reject_audit_application import reject_audit_application
    from notify.service.system_fail_withdraw_audit_store import fail_withdraw_audit_stores, fail_audit_stores_of_auto_align
    from notify.service.waitlist_audit_application import waitlist_audit_application
    from notify.service.hide_audit_store_section import hide_audit_store_section
    # from notify.service.mail_full_time_opportunity import send_full_time_opportunity_emails
    from notify.service.mail_qa_performance import qa_performance_report
    # from notify.service.add_payout_beneficiary import add_beneficiary
    from notify.service.auto_audit_alignment import auto_approve_audit_application
    
    from notify.service.auto_super_auditor_assign import auto_approve_for_super_auditor
    
    from notify.service.tattava_last_day_report_mail import auto_tattava_mail_for_last_day_completed_report
    # from notify.service.tattava_reporting_to_admin import auto_tattava_reporting_to_admin_after_48_hour_not_logged_in_non_admin_client_user
    from notify.service.tattava_target_date_reminder import auto_tattava_report_action_target_date_to_admin
    
    # set up schedules for audit reminders
    # Executes every day at 1230 UTC == 1800 IST
    queue_at = crontab(hour=12, minute=30)
    sender.add_periodic_task(queue_at, send_pre_audit_reminders.s())
    # sender.add_periodic_task(queue_at, send_post_audit_reminders.s()) --comment-- stopped to send post audit email
    # setup schedules for sending completed reports to client
    sender.add_periodic_task(queue_at, send_mail_to_client.s())
    # setup schedules for sending reporting stats
    sender.add_periodic_task(queue_at, reporting_stats_send_mail.s())
    sender.add_periodic_task(queue_at, fail_withdraw_audit_stores.s())

    # Executes every day at 0330 UTC == 0900 IST
    queue_at_9 = crontab(hour=3, minute=30)
    # This cron will send mail next day of audit date at 9 am
    sender.add_periodic_task(queue_at_9, send_on_audit_reminders.s())
    sender.add_periodic_task(queue_at_9, reject_audit_application.s())
    sender.add_periodic_task(queue_at_9, qa_performance_report.s())

    #send super auditor assign
    sender.add_periodic_task(queue_at_9,auto_approve_for_super_auditor.s())  
    
    # target date reminder to admin (action plan)
    sender.add_periodic_task(queue_at_9, auto_tattava_report_action_target_date_to_admin.s())
    
    # last day complete report send tattava user's
    sender.add_periodic_task(queue_at_9, auto_tattava_mail_for_last_day_completed_report.s())
    
    # send a mail admin for store manager is not active 
    # sender.add_periodic_task(queue_at_9,auto_tattava_reporting_to_admin_after_48_hour_not_logged_in_non_admin_client_user.s())
    
    # schedules for find repeated image attachment
    # Execute cron every five hours : midnight, 5am, 10am, 3pm, 8pm.
    queue_at_attachment = crontab(hour='*/5', minute=0)
    sender.add_periodic_task(queue_at_attachment, find_faulty_report.s())

    # Executes every day at 0230 UTC == 0800 IST
    queue_at_8 = crontab(hour=2, minute=30)
    # This cron will auto approve audit applications everyday at 8 am
    sender.add_periodic_task(queue_at_8, auto_approve_audit_application.s())
    sender.add_periodic_task(queue_at_8, fail_audit_stores_of_auto_align.s())

    # schedule for save audio transcription
    # Execute cron every midnight at 11:40
    # queue_at_midnight = crontab(hour=18, minute=20)
    # sender.add_periodic_task(queue_at_midnight, save_audio_transcription.s())

    # Schedule for change all application status in each store to waitlisted
    sender.add_periodic_task(queue_at, waitlist_audit_application.s())

    # Hide audit section when audits are completed
    sender.add_periodic_task(queue_at, hide_audit_store_section.s())

    # set up schedules for Full time opportunity
    # Executes every day at 0430 UTC == 1000 IST
    # queue_at_10 = crontab(hour=4, minute=30)
    # sender.add_periodic_task(queue_at_10, send_full_time_opportunity_emails.s())

    # set up schedules for generate beneficiary ids
    # Executes every day at 0330 UTC == 2100 IST
    # queue_at_9 = crontab(hour=3, minute=30)
    # sender.add_periodic_task(queue_at_9, add_beneficiary.s())