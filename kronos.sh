#!/bin/bash
gunicorn --error-logfile ./logs/gunicorn.err.log --access-logfile ./logs/gunicorn.access.log --log-level debug --bind 0.0.0.0:8000 -p ./logs/gunicorn.pid -D kronos.wsgi
