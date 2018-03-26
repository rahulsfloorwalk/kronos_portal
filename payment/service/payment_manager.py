import io
import csv
import xlsxwriter
import itertools
from kronos import utils
from django.utils import timezone
from django.db import connection
from django.db.transaction import atomic
from django.contrib.auth.models import Group
from auditor.models import BankInfo
from notifications.signals import notify
from notifications.models import Notification
from audit_store import service as audit_store_service
from payment.models import Payment
from notify import verbs

from django.conf import settings

from notify.service import mail_notify
from audit.service import audit_cycle as audit_cycle_service
from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER


def add_payment_on_audit_store_accepted(audit_store_id, payment_amount, user_actor):
    try:
        audit_store = audit_store_service.find_by_id(audit_store_id)
        payment = Payment()
        payment.audit_store = audit_store
        payment.user = audit_store.user
        payment.amount = payment_amount
        payment.comment = "Payment for {first} {last} for audit done on {date} for {client}".format(
            first=payment.audit_store.user.profileinfo.first_name,
            last=payment.audit_store.user.profileinfo.last_name,
            date=payment.audit_store.audit_date,
            client=payment.audit_store.audit.audit_cycle.client.name
        )
        payment.save()
        notify.send(
            user_actor,
            recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
            verb=verbs.AUDIT_STORE_PENDING,
            action_object=payment.audit_store,
            target=payment.audit_store.audit
        )
        manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
        notify.send(
            user_actor,
            recipient=payment.user,
            verb=verbs.AUDIT_STORE_PENDING,
            action_object=payment.audit_store,
            target=payment.audit_store.audit
        )
        auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))

    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e

def clear_payment_for_audit_store(audit_store_id):
    payment = Payment.objects.get(audit_store_id=audit_store_id)
    payment.status = Payment.PAID
    payment.save()

@atomic
def pay(payment_id, user_actor):
    try:
        payment = Payment.objects.get(pk=payment_id)
        if payment.status == Payment.PENDING:
            bi = payment.audit_store.user.bankinfo
            if not bi.is_complete():
                raise AppLogicError("Bank Details Incomplete")
            payment.status = Payment.PAID
            payment.paid_on = timezone.now()
            payment.comment = "payment done for {first} {last} in bank - {bank} ({ifsc}) for account number - {account}".format(
                first = payment.audit_store.user.profileinfo.first_name,
                last = payment.audit_store.user.profileinfo.last_name,
                bank = bi.bank_name,
                ifsc = bi.ifsc_code,
                account = bi.account_number
            )
            payment.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_PAID,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PAID).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=payment.user,
                verb=verbs.AUDIT_STORE_PAID,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PAID).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return payment
        else:
            raise AppLogicError("payment cannot be pending now")
    except BankInfo.DoesNotExist as e:
        raise AppLogicError("Bank details are not given") from e

@atomic
def unpay(payment_id, user_actor):
    try:
        payment = Payment.objects.get(pk=payment_id)
        if payment.status == Payment.PAID:
            payment.status = Payment.PENDING
            payment.paid_on = None
            payment.comment = "pending payment for {first} {last} for audit done on {date} for {client}".format(
                first=payment.audit_store.user.profileinfo.first_name,
                last=payment.audit_store.user.profileinfo.last_name,
                date=payment.audit_store.audit_date,
                client=payment.audit_store.audit.audit_cycle.client.name
            )
            payment.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_PENDING,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            # manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
            # connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=payment.user,
                verb=verbs.AUDIT_STORE_PENDING,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            # auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
            # connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return payment
        else:
            raise AppLogicError("payment cannot be done now")
    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def fail(payment_id, user_actor):
    try:
        payment = Payment.objects.get(pk=payment_id)
        if payment.status == Payment.PAID:
            payment.status = Payment.FAILED
            payment.paid_on = None
            payment.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_PENDING,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            # manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
            # connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=payment.user,
                verb=verbs.AUDIT_STORE_PENDING,
                action_object=payment.audit_store,
                target=payment.audit_store
            )
            # auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_PENDING).order_by('-id')[0].id
            # connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))

            # Add an additional pending payment
            add_payment_on_audit_store_accepted(payment.audit_store.id, payment.amount, user_actor)
            return payment
        else:
            raise AppLogicError("Cannot fail the payment")
    except Payment.DoesNotExist as e:
        raise ObjectNotFound from e

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

def find_pending_by_audit_cycle(audit_cycle_id):
    return Payment.objects.filter(audit_store__audit__audit_cycle_id=audit_cycle_id).filter(status=Payment.PENDING)

def find_pending_csv_for_audit_cycle(audit_cycle_id):
    output = io.StringIO()
    writer = csv.writer(output)

    pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    consilidated_payments = consolidate_by_user(pending_payments)
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    client = audit_cycle.client.name
    name = audit_cycle.name
    audit = client + "_" + name

    fieldnames = ['ORDERINGACCNO', 'REMITTER_NAME', 'IFSCCODE', 'BENEACCNO', 'BENENAME',
                  'BENEADD1', 'TXNREFNO', 'DATE', 'AMOUNT', 'SENTTORECVINFO', 'INDICATOR',
                  'DETAIL', 'ORIGINAL_REMITTER']
    writer.writerow(fieldnames)
    for payment in consilidated_payments:
        try:
            bank_name = payment.user.bankinfo.bank_name
            ifsc_code = payment.user.bankinfo.ifsc_code
            account_number = payment.user.bankinfo.account_number
        except BankInfo.DoesNotExist:
            bank_name = ""
            ifsc_code = ""
            account_number = ""

        if payment.user.profileinfo.city:
            city_name = payment.user.profileinfo.city.name
        else:
            city_name = "India"

        writer.writerow([
            settings.PAYMENT_CSV_SETTINGS['ORDERINGACCNO'],
            settings.PAYMENT_CSV_SETTINGS['REMITTER_NAME'],
            ifsc_code,
            "=\"" + account_number + "\"",
            (payment.user.profileinfo.first_name or "") + " " + (payment.user.profileinfo.last_name or ""),
            city_name,
            "",
            utils.today_ist().strftime("%d/%m/%Y"),
            payment.amount,
            settings.PAYMENT_CSV_SETTINGS['SENTTORECVINFO'],
            settings.PAYMENT_CSV_SETTINGS['INDICATOR'],
            payment.user.email,
            settings.PAYMENT_CSV_SETTINGS['ORIGINAL_REMITTER'],
        ])

    output.seek(0)

    return output, audit.replace(" ", "-") + "_payments.csv"


def find_new_pending_xlsx_for_audit_cycle(audit_cycle_id):
    pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    consilidated_payments = consolidate_by_user(pending_payments)
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    client = audit_cycle.client.name
    name = audit_cycle.name
    audit = client + "_" + name
    filename = audit.replace(" ", "-") + "_payments.xlsx"
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
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
        row_content = get_datarow_for_payment(payment)
        for cell in row_content:
            worksheet.write(row, col, cell)
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

    fieldnames = get_fieldnames()
    writer.writerow(fieldnames)
    for payment in consolidated_payments:
        datarow = get_datarow_for_payment(payment)
        writer.writerow(datarow)

    output.seek(0)

    return output, audit.replace(" ", "-") + "_payments.csv"


def get_datarow_for_payment(payment):
    try:
        bank_name = payment.user.bankinfo.bank_name
        ifsc_code = payment.user.bankinfo.ifsc_code.upper()
        account_number = payment.user.bankinfo.account_number
    except BankInfo.DoesNotExist:
        bank_name = ""
        ifsc_code = ""
        account_number = ""

    if payment.user.profileinfo.city:
        city_name = payment.user.profileinfo.city.name
    else:
        city_name = "India"
    datarow = [
        settings.PAYMENT_NEW_CSV_SETTINGS['Record_Identifier'],
        utils.today_ist().strftime("%d/%m/%Y"),
        payment.amount,
        "'" + settings.PAYMENT_NEW_CSV_SETTINGS['Debit_Account_No'],
        "",
        "",
        settings.PAYMENT_NEW_CSV_SETTINGS['Payment_Product_Code'],
        "",
        (payment.user.profileinfo.first_name or "") + " " + (payment.user.profileinfo.last_name or ""),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        settings.PAYMENT_NEW_CSV_SETTINGS['ReasonForPayment'],
        "'" + account_number,
        ifsc_code,
        payment.user.email,
        "",
        settings.PAYMENT_NEW_CSV_SETTINGS['Debit_Narration'],
        "",
        "",
        "",
    ]
    return datarow


def get_fieldnames():
    fieldnames = ['Record_Identifier', 'Payment_Value_Date', 'Payment_Amount', 'Debit_Account_No',
                  'Customer_Reference_No',
                  'Customer_Instrument_No', 'Payment_Product_Code', 'Beneficiary_Code', 'Beneficiary_Name',
                  'Beneficiary_Address1', 'Beneficiary_Address2', 'Beneficiary_Address3', 'Beneficiary_Address4',
                  'Payable_Loc_Code', 'Print_Branch_Code', 'Dispatch_Address1', 'Dispatch_Address2', 'Dispatch_Mode',
                  'Dispatch_To', 'Payment_Remarks', 'ReasonForPayment', 'Credit_Account_No', 'IFSC_Code',
                  'Notification_Emails',
                  'Enrichment1', 'Debit_Narration', 'Enrichment3', 'Enrichment4', 'Enrichment5']
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


@atomic
def pay_all_pending_for_audit_cycle(audit_cycle_id, user_actor):
    pending_payments = find_pending_by_audit_cycle(audit_cycle_id)
    for payment in pending_payments:
        pay(payment.id, user_actor)
    return len(pending_payments)
