import logging

from django.utils.html import strip_tags
from django.conf import settings
from django.template.loader import get_template

from notifications.models import Notification
from payment.models import Payment

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from .. import verbs

from celery import shared_task

from .mail import send_email

from registration.context import registration_context

_logger = logging.getLogger(__name__)

def send_notification_mail(notif_id, message):
    if settings.EMAIL_SWITCH['NOTIFICATION_EMAIL']:
        notification_email_task.delay(notif_id, message)
    else:
        _logger.info("notification email disabled. skipping email for notification id : %s", notif_id)


# the audit property may come from either an application or audit_store instance
def get_params_from_audit_store(audit_store, params):
    params['client'] = audit_store.audit.audit_cycle.client.auditor_display_name()
    params['store_name'] = audit_store.audit.store.name
    params['store_phone'] = audit_store.audit.store.phone
    params['store_address'] = audit_store.audit.store.address
    params['audit_date'] = audit_store.audit_date


def get_params_from_application(application, params):
    params['client'] = application.audit.audit_cycle.client.auditor_display_name()
    params['store_name'] = application.audit.store.name
    params['store_phone'] = application.audit.store.phone
    params['store_address'] = application.audit.store.address
    params['audit_date'] = application.audit_date


def get_params_from_payment(payment, params):
    params['client'] = payment.audit_store.audit.audit_cycle.client.auditor_display_name()
    params['store_name'] = payment.audit_store.audit.store.name
    params['store_phone'] = payment.audit_store.audit.store.phone
    params['store_address'] = payment.audit_store.audit.store.address
    params['audit_date'] = payment.audit_store.audit_date

@shared_task(ignore_result=True)
def notification_email_task(notif_id, message):
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
        if notif.verb == verbs.AUDIT_APPLICATION_APPLIED:
            get_params_from_application(notif.action_object, params)
            subject = "Audit Application for {}".format(params['client'])
            params['html_template'] = 'notify/application_email.html'
            params['txt_template'] = 'notify/application_email.txt'

        elif notif.verb == verbs.AUDIT_APPLICATION_CANCELED:
            get_params_from_application(notif.action_object, params)
            subject = "Audit Cancelled for {}".format(params['client'])
            params['html_template'] = 'notify/cancel_email.html'
            params['txt_template'] = 'notify/cancel_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_FIAT_ASSIGNED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Assigned for {}".format(params['client'])
            params['html_template'] = 'notify/fiat_assign_email.html'
            params['txt_template'] = 'notify/fiat_assign_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_STORE_ASSIGNED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Assigned for {}".format(params['client'])
            params['html_template'] = 'notify/assign_email.html'
            params['txt_template'] = 'notify/assign_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_STORE_ACKNOWLEDGED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Acknowledged for {}".format(params['client'])
            params['html_template'] = 'notify/acknowledge_email.html'
            params['txt_template'] = 'notify/acknowledge_email.txt'
            params['audit_cycle_post_approval_description'] = notif.target.audit_cycle.post_approval_description
            params['audit_post_approval_description'] = notif.target.post_approval_description

        elif notif.verb == verbs.AUDIT_APPLICATION_REJECTED:
            get_params_from_application(notif.action_object, params)
            subject = "Audit Application Not Accepted {}".format(params['client'])
            params['html_template'] = 'notify/reject_email.html'
            params['txt_template'] = 'notify/reject_email.txt'

        elif notif.verb == verbs.AUDIT_APPLICATION_WAITLISTED:
            get_params_from_application(notif.action_object, params)
            subject = "Audit Application has been wait listed for {}".format(params['client'])
            params['html_template'] = 'notify/waitlist_email.html'
            params['txt_template'] = 'notify/waitlist_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_WITHDRAWN:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Withdrawn for {}".format(params['client'])
            params['html_template'] = 'notify/withdrawn_email.html'
            params['txt_template'] = 'notify/withdrawn_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_SUBMITTED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Report Submitted for {}".format(params['client'])
            params['html_template'] = 'notify/submitted_email.html'
            params['txt_template'] = 'notify/submitted_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_UNSUBMITTED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Report Unsubmitted for {}".format(params['client'])
            params['html_template'] = 'notify/unsubmitted.html'
            params['txt_template'] = 'notify/unsubmitted.txt'

        elif notif.verb == verbs.AUDIT_STORE_COMPLETED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Report Completed for {}".format(params['client'])
            params['html_template'] = 'notify/completed_email.html'
            params['txt_template'] = 'notify/completed_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_FAILED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Rejected for {}".format(params['client'])
            params['message'] = message
            params['html_template'] = 'notify/failed_email.html'
            params['txt_template'] = 'notify/failed_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_ACCEPTED:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Audit Report Accepted for {}".format(params['client'])
            params['html_template'] = 'notify/report_accepted_email.html'
            params['txt_template'] = 'notify/report_accepted_email.txt'

        elif notif.verb == verbs.AUDIT_STORE_PAID:
            get_params_from_audit_store(notif.action_object, params)
            subject = "Payment cleared for {}".format(params['client'])
            params['html_template'] = 'notify/report_paid_email.html'
            params['txt_template'] = 'notify/report_paid_email.txt'
            params['amount'] = notif.action_object.payments.filter(status=Payment.PAID)[0].amount
            params['account'] = notif.action_object.user.bankinfo.account_number

            # This assumes that there will be at least 1 payment.

        elif notif.verb == verbs.PAYMENT_FAILED:
            get_params_from_payment(notif.action_object, params)
            subject = "Payment Failed for {}".format(params['client'])
            params['html_template'] = 'notify/payment_failed_email.html'
            params['txt_template'] = 'notify/payment_failed_email.txt'
            params['amount'] = notif.action_object.amount
            params['account'] = notif.action_object.user.bankinfo.account_number

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

