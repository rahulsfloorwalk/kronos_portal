import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kronos.settings")


broker_url = 'sqs://-----:-------------@'
broker_url = 'amqp://guest@localhost'
imports = ('registration.service.mail',)

queue_prefix = 'fw-testing'
 
app = Celery(__name__, broker=broker_url, include=imports)

#app.config_from_object({
#        "task_default_queue": "fw-portal-testing",
#        "task_routes" : {
#                'registration.service.mail.send_verification_email': queue_prefix + '-portal-signup-email',
#                'registration.service.mail.send_welcome_email': queue_prefix + '-portal-welcome-email',
#                #'registration.service.mail.send_welcome_email': queue_prefix + '-portal-notifications',
#        }
#})

#app.conf.broker_transport_options = { 'region': 'sqs.ap-southeast-1' };

#app.autodiscover_tasks(imports,force=True)
