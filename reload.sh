#!/bin/bash

if [[ -f ./logs/gunicorn.pid ]];
then
	kill -HUP `cat ./logs/gunicorn.pid`;
else
	echo "Could not reload: ./logs/gunicorn.pid file not found";
fi

