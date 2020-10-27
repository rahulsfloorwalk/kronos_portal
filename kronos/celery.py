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
    from attachment.save_audio_transcription import save_audio_transcription

    # set up schedules for audit reminders
    # Executes every day at 1230 UTC == 1800 IST
    queue_at = crontab(hour=12, minute=30)
    sender.add_periodic_task(queue_at, send_pre_audit_reminders.s())
    # sender.add_periodic_task(queue_at, send_post_audit_reminders.s()) --comment-- stopped to send post audit email
    # setup schedules for sending completed reports to client
    sender.add_periodic_task(queue_at, send_mail_to_client.s())
    # setup schedules for sending reporting stats
    sender.add_periodic_task(queue_at, reporting_stats_send_mail.s())

    # Executes every day at 0330 UTC == 0900 IST
    queue_at_9 = crontab(hour=3, minute=30)
    # This cron will send mail next day of audit date at 9 am
    sender.add_periodic_task(queue_at_9, send_on_audit_reminders.s())


    # schedules for find repeated image attachment
    # Execute cron every five hours : midnight, 5am, 10am, 3pm, 8pm.
    queue_at_attachment = crontab(hour='*/5', minute=0)
    sender.add_periodic_task(queue_at_attachment, find_faulty_report.s())

    # schedule for save audio transcription
    # Execute cron every one hour
    queue_for_transcription = crontab(hour='*/1', minute=0)
    sender.add_periodic_task(queue_for_transcription, save_audio_transcription.s())
