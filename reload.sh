#!/bin/bash

RC=0

if [[ -f ./logs/gunicorn.pid ]];
then
	GUNICORN_PID=`cat ./logs/gunicorn.pid`;
	echo "reloading gunicorn pid: $GUNICORN_PID";
	kill -HUP `cat ./logs/gunicorn.pid`;
else
	echo "PID file not found: ./logs/gunicorn.pid";
	echo "starting gunicorn";
	gunicorn --error-logfile ./logs/gunicorn.err.log --access-logfile ./logs/gunicorn.access.log --log-level debug --workers 4 --timeout 180 --bind 0.0.0.0:8000 -p ./logs/gunicorn.pid --statsd-host=localhost:8125 -D kronos.wsgi
	#GUNICORN_PID=`cat ./logs/gunicorn.pid`;
	#echo "gunicorn pid: $GUNICORN_PID"
fi

if [[ -f ./logs/celery_worker.pid ]];
then
	CELERY_WORKER_PID=`cat ./logs/celery_worker.pid`;
	kill $CELERY_WORKER_PID
	echo -n "waiting for celery worker to die "
	while ps -p $CELERY_WORKER_PID > /dev/null;
	do
		echo -n "...."
		sleep 1;
	done
	echo ""
	echo "reloading celery worker pid: $CELERY_PID";
	celery worker -A kronos.celery -l INFO --without-mingle --without-heartbeat --without-gossip -f logs/celery_worker.log --detach --pidfile=./logs/celery_worker.pid
	#CELERY_WORKER_PID=`cat ./logs/celery_worker.pid`;
	#echo "celery worker pid: $CELERY_WORKER_PID"
else
	echo "PID file not found: ./logs/celery_worker.pid";
	echo "starting celery worker...";
	celery worker -A kronos.celery -l INFO -f logs/celery_worker.log --detach --pidfile=./logs/celery_worker.pid
	#CELERY_WORKER_PID=`cat ./logs/celery_worker.pid`;
	#echo "celery worker pid: $CELERY_WORKER_PID"
fi

if [[ -f ./logs/celery_beat.pid ]];
then
	CELERY_BEAT_PID=`cat ./logs/celery_beat.pid`;
	kill $CELERY_BEAT_PID
	echo -n "waiting for celery beat to die "
	while ps -p $CELERY_BEAT_PID > /dev/null;
	do
		echo -n "...."
		sleep 1;
	done
	echo ""
	echo "reloading celery beat pid: $CELERY_BEAT_PID";
	celery beat -A kronos.celery -l DEBUG -f logs/celery_beat.log --detach --pidfile=./logs/celery_beat.pid
	#CELERY_BEAT_PID=`cat ./logs/celery_beat.pid`;
	#echo "celery beat pid: $CELERY_BEAT_PID"
else
	echo "PID file not found: ./logs/celery_beat.pid";
	echo "starting celery beat...";
	celery beat -A kronos.celery -l DEBUG -f logs/celery_beat.log --detach --pidfile=./logs/celery_beat.pid
	#CELERY_BEAT_PID=`cat ./logs/celery_worker.pid`;
	#echo "celery beat pid: $CELERY_BEAT_PID"
fi

exit $RC
