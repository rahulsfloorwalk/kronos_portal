from kronos.exceptions import AppLogicError, ObjectNotFound
from django.conf import settings
from client.models import Client,MPOrder,Transaction,MPClientProfileInfo
from registration.models import GROUP_NAME_CLIENT
from audit.models import AuditCycle
from django.template.loader import get_template
from registration.context import registration_context
from notify.service.mail import send_email
import logging
from celery import shared_task
from django.shortcuts import get_object_or_404

_logger = logging.getLogger(__name__)


def find_transaction_by_order_id(order_id):
    transaction = get_object_or_404(Transaction, id=order_id)
    return transaction

def success_payment_email_for_company(order_id):
    mp_order = MPOrder.objects.get(id=order_id)
    transaction = find_transaction_by_order_id(mp_order.id)

    account_email = ['pooja.satfale@floorwalk.in','sourabh@floorwalk.in','rahul.solanki@floorwalk.in']
    # account_email = ['rahul.solanki@floorwalk.in']
    send_payment_success_email.delay(account_email, order_id,transaction.id)
    return mp_order 

@shared_task(ignore_result=True)
def send_payment_success_email(email_address,order_id,transaction_id):
    mp_order = MPOrder.objects.get(id=order_id)
    client_profile = MPClientProfileInfo.objects.get(user=mp_order.user)
    transaction= Transaction.objects.get(id=transaction_id)

    params = {
        'order_id': mp_order.id,
        'brand': client_profile.brand,
        'solution': mp_order.solution,
        'no_of_audits':mp_order.no_of_response,
        'start_date': transaction.payment_success_date,
        **registration_context(),
    }

    # generate email from templates
    subject = "Looks like You have another request - Order ID: {} - Brand: {}".format( params['order_id'],params['brand'])
    html_message = get_template("notify/payment_success_email_for_company.html").render(params)
    txt_message = get_template("notify/payment_success_email_for_company.txt").render(params)
    
    _logger.info("Looks like You have another request : %s", email_address)
    send_email(email_address, subject, html_message, txt_message)
    _logger.info("Looks like You have another request : %s", email_address)


def failed_payment_email_for_company(order_id):
    mp_order = MPOrder.objects.get(id=order_id)

    account_email = ['pooja.satfale@floorwalk.in','sourabh@floorwalk.in','rahul.solanki@floorwalk.in']
    send_failed_payment_success_email.delay(account_email, order_id)
    return mp_order 

@shared_task(ignore_result=True)
def send_failed_payment_success_email(email_address,order_id):
    mp_order = MPOrder.objects.get(id=order_id)
    start_date = mp_order.modified_at.strftime('%Y-%m-%d')
    client_profile = MPClientProfileInfo.objects.get(user=mp_order.user)

    params = {
        'order_id': mp_order.id,
        'brand': client_profile.brand,
        'solution': mp_order.solution,
        'no_of_audits':mp_order.no_of_response,
        'start_date': start_date,
        **registration_context(),
    }

    # generate email from templates
    subject = "Looks like You have another request - {} - {}".format( params['order_id'],params['brand'], params['solution'], params['no_of_audits'], params['start_date'])
    html_message = get_template("notify/payment_success_email_for_company.html").render(params)
    txt_message = get_template("notify/payment_success_email_for_company.txt").render(params)
    
    _logger.info("Looks like You have another request : %s", email_address)
    send_email(email_address, subject, html_message, txt_message)
    _logger.info("Looks like You have another request : %s", email_address)

def active_cycle_email_for_client(order_id):
    mp_order = MPOrder.objects.get(id=order_id)
    client_profile = MPClientProfileInfo.objects.get(user=mp_order.user)

    account_email = [client_profile.user.email]
    active_cycle_success_email.delay(account_email, order_id)
    return mp_order 

@shared_task(ignore_result=True)
def active_cycle_success_email(email_address,order_id):
    mp_order = MPOrder.objects.get(id=order_id)
    client_profile = MPClientProfileInfo.objects.get(user=mp_order.user)

    params = {
        'brand': client_profile.brand,
        **registration_context(),
    }

    # generate email from templates
    subject = "Welcome on Onboard the FloorWalk Express - {}".format(params['brand'])
    html_message = get_template("notify/active_cycle_email_for_client.html").render(params)
    txt_message = get_template("notify/active_cycle_email_for_client.txt").render(params)
    
    _logger.info("Welcome on Onboard the FloorWalk Express : %s", email_address)
    send_email(email_address, subject, html_message, txt_message)
    _logger.info("Welcome on Onboard the FloorWalk Express : %s", email_address)

