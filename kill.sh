#!/bin/bash

RC=0

if [[ -f ./logs/gunicorn.pid ]];
then
	kill `cat ./logs/gunicorn.pid`;
else
	echo "Could not kill: ./logs/gunicorn.pid file not found";
	RC=1
fi

if [[ -f ./logs/celery_worker.pid ]];
then
	kill `cat ./logs/celery_worker.pid`;
else
	echo "Could not kill: ./logs/celery_worker.pid file not found";
	RC=1
fi

exit $RC
