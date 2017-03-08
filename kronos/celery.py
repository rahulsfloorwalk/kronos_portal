import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kronos.settings")


broker_url = 'sqs://-----:-------------@'
imports = ('registration.service.mail',)
 
app = Celery(__name__, broker=broker_url, include=imports)

app.conf.broker_transport_options = {'region': 'sqs.ap-southeast-1'}

#app.autodiscover_tasks(imports,force=True)
