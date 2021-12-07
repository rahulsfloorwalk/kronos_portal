import logging

from datetime import timedelta
from django.conf import settings
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

from monitoring.service import email_log_service

from audit_store.models import AuditStore
from manager.service.moderator import find_all, find_by_id
from registration.context import registration_context

from guardian.models import UserObjectPermission
from kronos.celery import app

_logger = logging.getLogger(__name__)

@app.task(ignore_result=True)
def qa_performance_report():
    today = timezone.now()
    yesterday = today.date() - timedelta(days=1)

    audit_reports = AuditStore.objects.filter(status__in = [AuditStore.SUBMITTED]).distinct('id')

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

    perms = UserObjectPermission.objects.filter(content_type=content_type, permission=permission, user__is_active=True)

    moderator_list = find_all().filter(is_active = True)
    for moderator in moderator_list:
        yesterday_pending_reports = audit_reports.filter(audit_date = yesterday).values('id')
        previous_pending_reports = audit_reports.filter(audit_date__lt = yesterday).values('id')

        yesterday_pending_reports = [str(report["id"]) for report in yesterday_pending_reports]
        previous_pending_reports = [str(report["id"]) for report in previous_pending_reports]

        yesterday_pending = perms.filter(object_pk__in=yesterday_pending_reports, user = moderator.id).count()
        previous_pending = perms.filter(object_pk__in=previous_pending_reports, user = moderator.id).count()
        total_pending_reports = yesterday_pending + previous_pending

        data = {
            'yesterday_pending': yesterday_pending,
            'previous_pending': previous_pending,
            'total_pending_reports': total_pending_reports,
            'yesterday_date': yesterday.strftime("%b %d, %Y"),
            'user_id': moderator.id
        }

        if settings.EMAIL_SWITCH['QA_PENDING_NOTIFICATION_EMAIL']:
            _logger.info("QA pending notification email sending for %s", moderator.email)
            qa_notification_email_task.delay(data)
        else:
            _logger.info("QA pending notification message disabled. skipping message for qa id %s", moderator.id)

    return True


@app.task(ignore_result=True)
def qa_notification_email_task(data):
    yesterday_pending = data['yesterday_pending']
    previous_pending = data['previous_pending']
    total_pending_reports = data['total_pending_reports']
    yesterday_date = data['yesterday_date']
    moderator_id = data['user_id']

    params = {
        **registration_context(),
    }
    moderator_obj = find_by_id(moderator_id)
    to_email = moderator_obj.email
    subject = "{} report is pending today".format(str(total_pending_reports))
    if total_pending_reports > 1:
        subject = "{} reports are pending today".format(str(total_pending_reports))
    params['subject_text'] = subject
    params['yesterday_pending'] = yesterday_pending
    params['previous_pending'] = previous_pending
    params['total_pending_reports'] = total_pending_reports
    params['yesterday_date'] = yesterday_date
    html_message = get_template("notify/qa_performance_email.html").render(params)
    txt_message = get_template("notify/qa_performance_email.txt").render(params)
    send_email(to_email, subject, html_message, txt_message)




SUBJECT_PREFIX = "[FloorWalk]"

def send_email(to_email, subject, html_message, txt_message):
    "prepends a [FloorWalk] to the subject and sends an email containing both the HTML and plain text versions to to_email"

    cc_emails = ('sourabh@floorwalk.in', 'tiyasha.roy@floorwalk.in', 'renuka.phatak@floorwalk.in',)
    subject = "{} {}".format(SUBJECT_PREFIX, subject)
    msg = EmailMultiAlternatives(subject, txt_message, to=(to_email,), cc=cc_emails)
    msg.attach_alternative(html_message, "text/html")
    msg.send()

    return email_log_service.log_email(to_email, subject, html_message, txt_message)

