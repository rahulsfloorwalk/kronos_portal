#!/bin/bash

RC=0

if [[ -f ./logs/gunicorn.pid ]];
then
	echo "reloading gunicorn pid: $(cat ./logs/gunicorn.pid)";
	kill -HUP `cat ./logs/gunicorn.pid`;
else
	echo "Could not reload: ./logs/gunicorn.pid file not found";
	RC=1
fi

if [[ -f ./logs/celery_worker.pid ]];
then
	CELERY_PID=`cat ./logs/celery_worker.pid`;
	kill $CELERY_PID
	echo -n "waiting for celery to die "
	while ps -p $CELERY_PID > /dev/null;
	do
		echo -n "...."
		sleep 1;
	done
	echo ""
	echo "reloading celery worker pid: $CELERY_PID";
	celery worker -A kronos.celery -l INFO -f logs/celery.log -D --pidfile=./logs/celery_worker.pid
else
	echo "Could not reload: ./logs/celery_worker.pid file not found";
	RC=1
fi

exit $RC
