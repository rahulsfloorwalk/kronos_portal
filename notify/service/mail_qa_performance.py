import logging
from datetime import timedelta
from django.conf import settings
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

from kronos.utils import today_ist
from monitoring.service import email_log_service

from audit_store.models import AuditStore
from manager.service.moderator import find_all, find_by_id
from registration.context import registration_context

from guardian.models import UserObjectPermission
from kronos.celery import app

_logger = logging.getLogger(__name__)

BLOCKED_EMAILS = {
    "vodafone-ownstore-newsimonboarding@gmail.com",
    "vodafone-ownstore-migrationoutbound@gmail.com",
    "vodafone-dealer@gmail.com",
    "vodafone-estore-newsimonboarding@gmail.com",
    "vodafone-estore-datavalidation@gmail.com",
    "vodafone-callcenter@gmail.com",
    "vodafone-competitioncallcenter@gmail.com",
    "vodafone-whatsapp@gmail.com",
    "vodafone-competitionwhatsapp@gmail.com",
    "vodafone-facebook@gmail.com",
    "vodafone-competitionfacebook@gmail.com",
    "vodafone-instagram@gmail.com",
    "vodafone-competitioninstagram@gmail.com",
    "vodafone-x@gmail.com",
    "vodafone-competition-x@gmail.com",
    "vodafone-competitionmobileapp@gmail.com",
    "vodafone-digitaltelesales@gmail.com",
    "vodafone-competitorsstores@gmail.com",
    "qavodafone-ownstore-newsimonboarding@gmail.com",
    "qavodafone-ownstore-migrationoutbound@gmail.com",
    "qavodafone-dealer@gmail.com",
    "qavodafone-estore-newsimonboarding@gmail.com",
    "qavodafone-estore-datavalidation@gmail.com",
    "qavodafone-callcenter@gmail.com",
    "qavodafone-competitioncallcenter@gmail.com",
    "qavodafone-whatsapp@gmail.com",
    "qavodafone-competitionwhatsapp@gmail.com",
    "qavodafone-facebook@gmail.com",
    "qavodafone-competitionfacebook@gmail.com",
    "qavodafone-instagram@gmail.com",
    "qavodafone-competitioninstagram@gmail.com",
    "qavodafone-x@gmail.com",
    "qavodafone-competition-x@gmail.com",
    "qavodafone-competitionmobileapp@gmail.com",
    "qavodafone-digitaltelesales@gmail.com",
    "qavodafone-competitorsstores@gmail.com",
    "friendi-retailaudit@gmial.com",
    "friendi-simwithcopyofid@gmial.com",
    "friendi-multiplesim1id@gmial.com",
    "qafriendi-retailaudit@gmial.com",
    "qafriendi-simwithcopyofid@gmial.com",
    "qafriendi-multiplesim1id@gmial.com",
    "virgin-multiplesimsameid@gmial.com",
    "virgin-competitionmultiplesim@gmial.com",
    "virgin-simwithoutid@gmial.com",
    "virgin-competitionsimwithoutid@gmial.com",
    "qavirgin-multiplesimsameid@gmial.com",
    "qavirgin-competitionmultiplesim@gmial.com",
    "qavirgin-simwithoutid@gmial.com",
    "qavirgin-competitionsimwithoutid@gmial.com",
    "neerjavaidya@floorwalk.in",
    "qasuhail@simpa-mr.com",
    "demo.qa@floorwalk.in",
}

def is_email_blocked(email):
    """Check if the email is in the blocked list."""
    return email in BLOCKED_EMAILS

@app.task(ignore_result=True)
def qa_performance_report():
    today = timezone.now()
    yesterday = today.date() - timedelta(days=1)

    audit_reports = AuditStore.objects.filter(status__in = [AuditStore.SUBMITTED]).distinct('id')

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

    perms = UserObjectPermission.objects.filter(content_type=content_type, permission=permission, user__is_active=True)

    moderator_list = find_all().filter(is_active = True)
    pending_report_list = []
    for moderator in moderator_list:
        yesterday_pending_reports = audit_reports.filter(submit_at__date = yesterday).values('id')
        previous_pending_reports = audit_reports.filter(submit_at__date__lt = yesterday).values('id')

        yesterday_pending_reports = [str(report["id"]) for report in yesterday_pending_reports]
        previous_pending_reports = [str(report["id"]) for report in previous_pending_reports]

        yesterday_pending = perms.filter(object_pk__in=yesterday_pending_reports, user = moderator.id).count()
        previous_pending = perms.filter(object_pk__in=previous_pending_reports, user = moderator.id).count()
        total_pending_reports = yesterday_pending + previous_pending

        report = {
            'yesterday_pending': yesterday_pending,
            'previous_pending': previous_pending,
            'total_pending_reports': total_pending_reports,
            'yesterday_date': yesterday.strftime("%b %d, %Y"),
            'user_id': moderator.id,
            'user_email': moderator.email
        }
        pending_report_list.append(report)

    if settings.EMAIL_SWITCH['QA_PENDING_NOTIFICATION_EMAIL']:
        consolidate_qa_notification_email_task.delay(pending_report_list)
        # qa_notification_email_task.delay(report)
    else:
        _logger.info("QA pending notification message disabled. skipping message for qa")
    return True


@app.task(ignore_result=True)
def consolidate_qa_notification_email_task(pending_reports):
    params = {
        **registration_context(),
    }
    yesterday_date = today_ist() - timedelta(days=1)

    to_email_list = [report['user_email'] for report in pending_reports]
    total_pending_reports = 0
    for report in pending_reports:
        total_pending_reports += int(report['total_pending_reports'])

    subject = "{} report is pending today".format(str(total_pending_reports))
    if total_pending_reports > 1:
        subject = "{} reports are pending today".format(str(total_pending_reports))

    params['yesterday_date'] = yesterday_date
    params['pending_reports'] = pending_reports
    html_message = get_template("notify/qa_performance_email.html").render(params)
    txt_message = get_template("notify/qa_performance_email.txt").render(params)
    send_email(to_email_list, subject, html_message, txt_message)
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

    if isinstance(to_email, str):
        to_email = [to_email]

    filtered_emails = [email for email in to_email if not is_email_blocked(email)]

    if not filtered_emails:
        return False

    cc_emails = ('sourabh@floorwalk.in',)
    subject = "{} {}".format(SUBJECT_PREFIX, subject)
    msg = EmailMultiAlternatives(subject, txt_message, to=filtered_emails, cc=cc_emails)
    msg.attach_alternative(html_message, "text/html")
    msg.send()

    return email_log_service.log_email(filtered_emails, subject, html_message, txt_message)

