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

    from notify.service.mail_reminders import send_pre_audit_reminders, send_on_audit_reminders, send_post_audit_reminders
    from notify.service.alert_faulty_report import find_faulty_report

    # set up schedules for audit reminders
    # Executes every day at 1230 UTC == 1800 IST
    queue_at = crontab(hour=12, minute=30)
    sender.add_periodic_task(queue_at, send_pre_audit_reminders.s())
    sender.add_periodic_task(queue_at, send_on_audit_reminders.s())
    sender.add_periodic_task(queue_at, send_post_audit_reminders.s())

    # schedules for find repeated image attachment
    # Execute cron every five hours : midnight, 5am, 10am, 3pm, 8pm.
    queue_at_attachment = crontab(hour='*/5', minute=0)
    sender.add_periodic_task(queue_at_attachment, find_faulty_report.s())