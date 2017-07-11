import logging
import os

from celery import Celery
from celery.schedules import crontab


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kronos.settings")

_logger = logging.getLogger(__name__)

broker_url = 'amqp://guest@localhost'

imports = (
        'registration.service.mail',
        'notify.service.mail_notify',
        'notify.service.mail_reminders',
        )

queue_prefix = 'fw-testing'

app = Celery(__name__, broker=broker_url, include=imports)

@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):

    from notify.service.mail_reminders import send_pre_audit_reminders, send_on_audit_reminders, send_post_audit_reminders

    # set up schedules for audit reminders
    # Executes every day at 1230 UTC == 1800 IST
    queue_at = crontab(hour=12, minute=30)
    sender.add_periodic_task( queue_at, send_pre_audit_reminders.s())
    sender.add_periodic_task( queue_at, send_on_audit_reminders.s())
    sender.add_periodic_task( queue_at, send_post_audit_reminders.s())

