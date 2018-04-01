import logging

from django.utils.html import strip_tags
from django.conf import settings
from django.template.loader import get_template

from notifications.models import Notification

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from .. import verbs

from celery import shared_task

from .mail import send_email

from registration.context import registration_context

_logger = logging.getLogger(__name__)

def send_notification_mail(notif_id):
    if settings.EMAIL_SWITCH['NOTIFICATION_EMAIL']:
        notification_email_task.delay(notif_id)
    else:
        _logger.info("notification email disabled. skipping email for notification id : %s", notif_id)


@shared_task(ignore_result=True)
def notification_email_task(notif_id):
    '''generates and sends a notificaiton email based on given notification id and configured rules'''
    notif = Notification.objects.get(pk=notif_id)
    if notif.emailed:
        _logger.info("notification email already sent for id id %s", notif_id)
        return notif.emailed

    if notif.recipient.groups.filter(name=GROUP_NAME_MANAGER).all():
        _logger.info("skipping notification email with id %s to manager", notif_id)
        return notif.emailed
    elif notif.recipient.groups.filter(name=GROUP_NAME_AUDITOR).all():
        to_email = notif.recipient.email
        params = {
            **registration_context(),
        }
        params['name'] = notif.recipient.profileinfo.first_name

        # the audit_date property may come from either an application or audit_store instance
        params['audit_date'] = notif.action_object.audit_date

        # the audit property may come from either an application or audit_store instance
        params['client'] = notif.action_object.audit.audit_cycle.client.auditor_display_name()
        params['store_name'] = notif.action_object.audit.store.name
        params['store_phone'] = notif.action_object.audit.store.phone
        params['store_address'] = notif.action_object.audit.store.address

        if notif.verb == verbs.AUDIT_APPLICATION_APPLIED:
            subject = "Audit Application for {}".format(params['client'])
            params['html_template'] = 'notify/application_email.html'
            params['txt_template'] = 'notify/application_email.txt'

        elif notif.verb == verbs.AUDIT_APPLICATION_CANCELED:
            subject = "Audit Cancelled for {}".format(params['client'])
            params['html_template'] = 'notify/cancel_email.html'
            params['txt_template'] = 'notify/cancel_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_FIAT_ASSIGNED:
            subject = "Audit Assigned for {}".format(params['client'])
            params['html_template'] = 'notify/fiat_assign_email.html'
            params['txt_template'] = 'notify/fiat_assign_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_STORE_ASSIGNED:
            subject = "Audit Assigned for {}".format(params['client'])
            params['html_template'] = 'notify/assign_email.html'
            params['txt_template'] = 'notify/assign_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_STORE_ACKNOWLEDGED:
            subject = "Audit Acknowledged for {}".format(params['client'])
            params['html_template'] = 'notify/acknowledge_email.html'
            params['txt_template'] = 'notify/acknowledge_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_APPLICATION_REJECTED:
            subject = "Audit Application Not Accepted {}".format(params['client'])
            params['html_template'] = 'notify/reject_email.html'
            params['txt_template'] = 'notify/reject_email.txt'

        elif notif.verb == verbs.AUDIT_APPLICATION_WAITLISTED:
            subject = "Audit Application has been wait listed for {}".format(params['client'])
            params['html_template'] = 'notify/waitlist_email.html'
            params['txt_template'] = 'notify/waitlist_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_WITHDRAWN:
            subject = "Audit Withdrawn for {}".format(params['client'])
            params['html_template'] = 'notify/withdrawn_email.html'
            params['txt_template'] = 'notify/withdrawn_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_SUBMITTED:
            subject = "Audit Report Submitted for {}".format(params['client'])
            params['html_template'] = 'notify/submitted_email.html'
            params['txt_template'] = 'notify/submitted_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_UNSUBMITTED:
            subject = "Audit Report Unsubmitted for {}".format(params['client'])
            params['html_template'] = 'notify/unsubmitted.html'
            params['txt_template'] = 'notify/unsubmitted.txt'

        elif notif.verb == verbs.AUDIT_STORE_COMPLETED:
            subject = "Audit Report Completed for {}".format(params['client'])
            params['html_template'] = 'notify/completed_email.html'
            params['txt_template'] = 'notify/completed_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_FAILED:
            subject = "Audit Failed for {}".format(params['client'])
            params['html_template'] = 'notify/failed_email.html'
            params['txt_template'] = 'notify/failed_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_ACCEPTED:
            subject = "Audit Report Accepted for {}".format(params['client'])
            params['html_template'] = 'notify/report_accepted_email.html'
            params['txt_template'] = 'notify/report_accepted_email.txt'

        # elif notif.verb == verbs.AUDIT_STORE_REJECTED:
        #     subject = "Audit Failed for {}".format(params['client'])
        #     params['html_template'] = 'notify/report_reject_email.html'
        #     params['txt_template'] = 'notify/report_reject_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_PAID:
            subject = "Payment cleared for {}".format(params['client'])
            params['html_template'] = 'notify/report_paid_email.html'
            params['txt_template'] = 'notify/report_paid_email.txt'
            params['amount'] = notif.action_object.payment.amount
            params['account'] = notif.action_object.payment.user.bankinfo.account_number

        else:
            return False

        html_message, txt_message = _prepare_mail(params)
        send_email(to_email, subject, html_message, txt_message)
        notif.emailed = True
        notif.save()
        return notif.emailed


def _prepare_mail(params):
    html_message = get_template(params.get('html_template')).render(params)
    txt_message = strip_tags(html_message)
    # txt_message = get_template(params.get('txt_template')).render(params)

    return html_message, txt_message

