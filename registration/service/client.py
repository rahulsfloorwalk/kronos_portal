import logging

from django.contrib.auth.models import User, Group
from django.conf import settings
from django.db.transaction import atomic
from django.template.loader import get_template
from django.core.mail import EmailMessage

import strings

from kronos.exceptions import ObjectNotFound
from client.models import Client, ClientUser, BankInfo
from registration.service import verification_service
from registration.service import mobile_number_service
from registration.context import registration_context
from registration.models import GROUP_NAME_CLIENT

_logger = logging.getLogger(__name__)

@atomic
def client_signup(email, password, client_name, full_name, mobile_number):
    client = Client.objects.create_client(email, client_name, mobile_number, is_auto_signup = True)
    client_user = ClientUser.objects.create_client_user(email, password, client, full_name, is_client_admin = True)
    bank_info = BankInfo(client=client)
    bank_info.save()

    mobile_number_service.save_mobile_number_for_user(client_user.user, mobile_number)

    verification_service.create_verification_for_user(client_user.user)

    send_client_verification_email(client_user.user.id)
    return client_user.user


def send_client_verification_email(user_id):
    verification = verification_service.find_verification_by_user_id(user_id)

    message = get_template('registration/client/email_verification.html').render({
        'key': verification.activation_key,
        'email': verification.user.email,
        **registration_context(),
    })

    msg = EmailMessage(strings.SIGN_UP_SUBJECT, message, to=(verification.user.email,))
    msg.content_subtype = 'html'

    if settings.EMAIL_SWITCH['CLIENT_VERIFICATION_EMAIL']:
        msg.send()
        _logger.info("verification email sent to user : %s", verification.user.email)
    else:
        _logger.info("verification email disabled. skipping email for user : %s", verification.user.email)
        _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)


def find_client_user_by_user_id(user_id):
    try:
        return Group.objects.get(name=GROUP_NAME_CLIENT).user_set.get(pk=user_id)
    except(Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e
