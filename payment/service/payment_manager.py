import io
import csv
import xlsxwriter
import itertools
import datetime
from kronos import utils
from django.utils import timezone
from django.db.transaction import atomic
from django.contrib.auth.models import Group
from auditor.models import BankInfo
from notifications.signals import notify
from notifications.models import Notification
from audit_store import service as audit_store_service
from payment.models import Beneficiary, Payment
from notify import verbs

from notify.service import mail_notify
from audit.service import audit_cycle as audit_cycle_service
from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR, GROUP_NAME_AGENCY


def get_payment_comment_for_pending_status(audit_store):
    user = audit_store.user
    if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        payment_comment = "Payment for {first} {last} for audit done on {date} for {client}".format(
            first=user.profileinfo.first_name,
            last=user.profileinfo.last_name,
            date=audit_store.audit_date,
            client=audit_store.audit.audit_cycle.client.name
        )
    elif user.groups.filter(name=GROUP_NAME_AGENCY).exists():
        payment_comment = "Payment for {agency_name} for audit done on {date} for {client}".format(
            agency_name=user.agencyuser.agency.account_holder_name,
            date=audit_store.audit_date,
            client=audit_store.audit.audit_cycle.client.name
        )
    else:
        raise AppLogicError('Payment user is not auditor or agency')
    return payment_comment


def get_payment_comment_for_paid_status(audit_store):
    user = audit_store.user
    if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        bi = user.bankinfo
        if not bi.is_payable():
            raise AppLogicError("Payment not payable due to incomplete fields")
        payment_comment = "payment done for {first} {last} in bank - {bank} ({ifsc}) for account number - {account}".format(
            first=user.profileinfo.first_name,
            last=user.profileinfo.last_name,
            bank=bi.bank_name,
            ifsc=bi.ifsc_code,
            account=bi.account_number
        )
    elif user.groups.filter(name=GROUP_NAME_AGENCY).exists():
        payment_comment = "payment done for {name} in account number - {account}".format(
            name=user.agencyuser.agency.account_holder_name,
            account=user.agencyuser.agency.account_number
        )
    else:
        raise AppLogicError('Payment user is not auditor or agency')
    return payment_comment


def get_user_details_for_payment(payment):
    user = payment.user
    user_details = {}

    if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        user_details['name'] = (payment.user.profileinfo.first_name or "") + " " + (payment.user.profileinfo.last_name or "")
        try:
            user_details['ifsc'] = payment.user.bankinfo.ifsc_code.upper()
            user_details['account_number'] = payment.user.bankinfo.account_number
            if payment.user.bankinfo.paypal is not None:
                user_details['paypal'] = payment.user.bankinfo.paypal.upper()
            else:
                user_details['paypal'] = ''
        except BankInfo.DoesNotExist:
            user_details['ifsc'] = ''
            user_details['account_number'] = ''
            user_details['paypal'] = ''
    elif user.groups.filter(name=GROUP_NAME_AGENCY).exists():
        user_details['name'] = payment.user.agencyuser.agency.account_holder_name
        user_details['ifsc'] = payment.user.agencyuser.agency.ifsc_code.upper()
        user_details['account_number'] = payment.user.agencyuser.agency.account_number
    else:
        raise AppLogicError('Payment user is not auditor or agency')
    try:
        user_details['beneficiary_id'] = user.beneficiary.beneficiary_id
    except Beneficiary.DoesNotExist:
        user_details['beneficiary_id'] = ''
    return user_details


def is_payment_payable(payment):
    user = payment.user
    if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        try:
            bi = user.bankinfo
            if not bi.is_payable():
                return False
        except BankInfo.DoesNotExist:
            return False
    elif user.groups.filter(name=GROUP_NAME_AGENCY).exists():
        if not user.agencyuser.agency.is_bank_details_complete():
            return False
    else:
        return False
    return True


def add_payment_on_audit_store_accepted(audit_store_id, payment_amount, user_actor) -> (int, int):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        payment = Payment()
        payment.audit_store = audit_store
        payment.user = audit_store.user
        payment.amount = payment_amount
        payment.comment = get_payment_comment_for_pending_status(audit_store)
        payment.save()
        notify.send(
            user_actor,
            recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
            verb=verbs.AUDIT_STORE_PENDING,
            action_object=payment.audit_store,
            target=payment.audit_store.audit
        )
        manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
        notify.send(
            user_actor,
            recipient=payment.user,
            verb=verbs.AUDIT_STORE_PENDING,
            action_object=payment.audit_store,
            target=payment.audit_store.audit
        )
        auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
        return manager_notif_id, auditor_notif_id

    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e

def clear_payment_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PAID
    payment.save()

def pay(payment_id, user_actor):
    with atomic():
        payment = Payment.objects.get(pk=payment_id)
        if is_payment_payable(payment):
            if payment.status == Payment.PENDING:
                payment.status = Payment.PAID
                payment.paid_on = timezone.now()
                payment.comment = get_payment_comment_for_paid_status(payment.audit_store)
                payment.save()
                notify.send(
                    user_actor,
                    recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                    verb=verbs.AUDIT_STORE_PAID,
                    action_object=payment.audit_store,
                    target=payment.audit_store
                )
                manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PAID).order_by('-id')[0].id
                notify.send(
                    user_actor,
                    recipient=payment.user,
                    verb=verbs.AUDIT_STORE_PAID,
                    action_object=payment.audit_store,
                    target=payment.audit_store
                )
                auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PAID).order_by('-id')[0].id
            else:
                raise AppLogicError("payment cannot be pending now")
        else:
            raise AppLogicError("Bank Details Incomplete")
    mail_notify.send_notification_mail(manager_notif_id, "")
    mail_notify.send_notification_mail(auditor_notif_id, "")
    return payment

def fail(payment_id, user_actor):
    with atomic():
        try:
            payment = Payment.objects.get(pk=payment_id)
            if payment.status == Payment.PAID:
                payment.status = Payment.FAILED
                payment.save()
                notify.send(
                    user_actor,
                    recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                    verb=verbs.PAYMENT_FAILED,
                    action_object=payment,
                    target=payment.audit_store
                )
                # manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
                notify.send(
                    user_actor,
                    recipient=payment.user,
                    verb=verbs.PAYMENT_FAILED,
                    action_object=payment,
                    target=payment.audit_store
                )
                auditor_notif_id = Notification.objects.filter(verb=verbs.PAYMENT_FAILED).order_by('-id')[0].id

                # Add an additional pending payment
                notif_id1, notif_id2 = add_payment_on_audit_store_accepted(payment.audit_store.id, payment.amount, user_actor)
            else:
                raise AppLogicError("Cannot fail the payment")
        except Payment.DoesNotExist as e:
            raise ObjectNotFound from e
    # mail_notify.send_notification_mail(manager_notif_id)
    mail_notify.send_notification_mail(auditor_notif_id, "")
    mail_notify.send_notification_mail(notif_id1, "")
    mail_notify.send_notification_mail(notif_id2, "")
    return payment


def clear_payment_for_audit_cycle(audit_cycle_id):
    Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id).update(status=Payment.PAID)


def get_pending_payments():
    payments = Payment.objects.filter(status=Payment.PENDING)
    return payments


def find_by_audit_cycle(audit_cycle_id):
    return Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id).prefetch_related(
        'user',
        'user__profileinfo',
    )

def find_by_audit_cycle_and_date(audit_cycle_id, start_date, end_date):
    if start_date == '' or end_date == '':
        raise AppLogicError('Payment dates is not valid')
    start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d')
    end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
    return Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id, audit_store__audit_date__range=(start_date, end_date)).prefetch_related(
        'user',
        'user__profileinfo',
    )

def find_pending_by_audit_cycle(audit_cycle_id):
    return Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id).filter(status=Payment.PENDING)

def find_new_pending_xlsx_for_audit_cycle(audit_cycle_id, start_date="", end_date=""):
    if start_date != "" and end_date != "":
        pending_payments = find_pending_by_audit_cycle(audit_cycle_id).filter(audit_store__audit_date__range=(start_date, end_date))
    else:
        pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    
    audit_store_ids = pending_payments.values_list('audit_store_id', flat=True)
    duplicate_audit_store_ids = [audit_store_id for audit_store_id in set(audit_store_ids) if len([payment for payment in pending_payments if payment.audit_store_id == audit_store_id]) > 1]
    if duplicate_audit_store_ids:
        error_message = "Error: Audit Store ID {} have multiple pending payments.".format(', '.join(map(str, duplicate_audit_store_ids)))
        return error_message , None

    consilidated_payments = consolidate_by_user(pending_payments)
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    client = audit_cycle.client.name
    name = audit_cycle.name
    audit = client + "_" + name
    payment_reason = "{} - {}".format(client, name)
    filename = audit.replace(" ", "-") + "_payments.xlsx"
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    text_format = workbook.add_format({'num_format': '@'})
    worksheet.set_column('A:AZ', 20)

    fieldnames = get_fieldnames()
    col = 0
    for name in fieldnames:
        worksheet.write(0, col, name)
        col += 1
    row = 0
    for payment in consilidated_payments:
        row += 1
        col = 0
        row_content = get_datarow_for_payment(payment, payment_reason)
        for cell in row_content:
            worksheet.write(row, col, cell, text_format)
            col += 1

    workbook.close()
    output.seek(0)
    return output, filename


def find_new_pending_csv_for_audit_cycle(audit_cycle_id):
    output = io.StringIO()
    writer = csv.writer(output)

    pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    consolidated_payments = consolidate_by_user(pending_payments)
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    client = audit_cycle.client.name
    name = audit_cycle.name
    audit = client + "_" + name
    payment_reason = "{} - {}".format(client, name)

    fieldnames = get_fieldnames()
    writer.writerow(fieldnames)
    for payment in consolidated_payments:
        datarow = get_datarow_for_payment(payment, payment_reason)
        writer.writerow(datarow)

    output.seek(0)

    return output, audit.replace(" ", "-") + "_payments.csv"


def get_datarow_for_payment(payment, payment_reason):
    user_details = get_user_details_for_payment(payment)
    datarow= [
        user_details['name'],
        "" + user_details['account_number'],
        user_details['ifsc'],
        payment.amount,
        'IMPS',
        'Auditor Payment',
        payment_reason,
        '',
        payment.user.email,
        payment.user.id,
        "FWTRANSFER00" + str(payment.id),
        user_details['paypal'],
    ]
    return datarow


def get_fieldnames():
    fieldnames = ['Beneficiary Name', 'Beneficiary Account Number',
                  'IFSC Code',
                  'Payout Amount', 'Payout Mode', 'Payout Narration',
                  'Notes',
                  'Phone Number', 'Email ID', 'Contact Reference ID', 'Payout Reference ID','Paypal ID']
    return fieldnames


def find_by_user(user_id):
    return Payment.objects.filter(user_id=user_id)

def find_by_audit_store(audit_store):
    return Payment.objects.filter(audit_store=audit_store)


def consolidate_by_user(payments):
    sorted_payments = sorted(payments, key=lambda k: k.user.id)
    consolidated_payments = []
    groups = []
    for k, g in itertools.groupby(sorted_payments, lambda x: x.user.id):
        groups.append(list(g))
    for group in groups:
        unique_user_payment = group[0]
        for duplicate_user_payment in group[1:]:
            unique_user_payment.amount += duplicate_user_payment.amount
        consolidated_payments.append(unique_user_payment)
    return consolidated_payments


def pay_all_pending_for_audit_cycle(audit_cycle_id, user_actor, start_date, end_date):
    if start_date != "" and end_date != "":
        pending_payments = find_pending_by_audit_cycle(audit_cycle_id).filter(audit_store__audit_date__range = [start_date, end_date])
    else:
        pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    for payment in pending_payments:
        pay(payment.id, user_actor)
    return len(pending_payments)
