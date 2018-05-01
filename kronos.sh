#!/bin/bash
echo "Starting gunicorn for kronos.wsgi ..."
gunicorn --error-logfile ./logs/gunicorn.err.log --access-logfile ./logs/gunicorn.access.log --log-level debug --bind 0.0.0.0:8000 -p ./logs/gunicorn.pid -D kronos.wsgi
echo "Starting celery worker kronos.celery ..."
celery worker -A kronos.celery -l INFO --without-mingle --without-heartbeat --without-gossip -f logs/celery_worker.log --detach --pidfile=./logs/celery_worker.pid
echo "Starting celery beat kronos.celery ..."
celery beat -A kronos.celery -l DEBUG -f logs/celery_beat.log --detach --pidfile=./logs/celery_beat.pid
