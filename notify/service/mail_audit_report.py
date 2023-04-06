import logging
import os
import tempfile

from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import get_template

from celery import shared_task

import convertapi

_logger = logging.getLogger(__name__)



@shared_task(ignore_result=True)
def audit_feedback_report_mail_task(email_list, rendered_report_data, data):
    convertapi.api_secret = settings.CONVERT_API_SECRET
    pdf_file = []

    try:
        upload_io = convertapi.UploadIO(rendered_report_data.encode("utf-8"), filename="report.html")
        params = {"File": upload_io, "StoreFile": False}
        pdf_file = convertapi.convert('pdf', params).save_files(tempfile.gettempdir())

        subject = "{} | Feedback Report: ({}) <> FloorWalk".format(data['brand_name'], data['audit_cycle_month'])
        body = get_template("notify/audit_feedback_report_email.html").render(data)
        email = EmailMessage(subject, body, to = email_list)
        email.content_subtype = "html"
        email.attach_file(pdf_file[0], "application/pdf")
        email.send()
        _logger.info("Audit report mail sent")
    except Exception as e:
        _logger.error("Audit report pdf mail error %s", str(e))
    finally:
        if pdf_file:
            if os.path.exists(pdf_file[0]):
                os.remove(pdf_file[0])
