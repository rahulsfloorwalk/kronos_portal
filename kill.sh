#!/bin/bash

if [[ -f ./logs/gunicorn.pid ]];
then
	kill `cat ./logs/gunicorn.pid`;
else
	echo "Could not kill: ./logs/gunicorn.pid file not found";
fi

