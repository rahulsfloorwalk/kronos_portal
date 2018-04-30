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

    # set up schedules for audit reminders
    # Executes every day at 1230 UTC == 1800 IST
    queue_at = crontab(hour=12, minute=30)
    sender.add_periodic_task(queue_at, send_pre_audit_reminders.s())
    sender.add_periodic_task(queue_at, send_on_audit_reminders.s())
    sender.add_periodic_task(queue_at, send_post_audit_reminders.s())

