import logging
from django.conf import settings
from django.core.validators import validate_email
from registration.service import client_mobile_number_service
import hashlib
from os import urandom
import datetime
from django.utils import timezone
from django.core.mail import EmailMessage
import strings
from rest_framework.authtoken.models import Token
from django.forms import ValidationError
from django.contrib.auth.models import User, Group
from django.db.models import Q
from client.models import MPClientProfileInfo
from registration.models import GROUP_NAME_CLIENT,Verification
from django.db import IntegrityError
from auditor.service import profile_info_service,market_place_api
from django.template.loader import get_template
from registration.context import registration_context

_logger = logging.getLogger(__name__)



def sign_up_market_place(data):
    to_check_email = data.get("username")
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'detail':'Please enter a valid email'}
        status = 400
        return response,status
    if to_check_email:
        to_check_email = to_check_email.strip().lower()
    
    if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email) ).exists():
        response={'detail':'a user with this email already exists'}
        status= 400
        return response,status
    
    if not len(data.get('phone')) == 10:
        response = {'detail': 'Phone number should be 10 digit'}
        status = 400
        return response, status
    if not profile_info_service.mobile_number_pattern.match(data.get('phone')):
        response = {'detail': 'invalid phone number'}
        status = 400
        return response, status
    if client_mobile_number_service.mobile_number_exists(data.get("phone")):
        response = {'detail': 'a user with this phone number already exists'}
        status = 400
        return response, status
    
    user=User()
    user.email = data.get("username")
    user.phone = data.get("phone")
    user.username = str.lower(data.get("username"))
    user.set_password(data.get("password"))
    user.save()
    user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
    user.save()
    
    client_profile = MPClientProfileInfo(user_id=user.id,mobile_number=user.phone)
    client_profile.save()
    
    auth_data = {}
    auth_data['email'] = data.get("username")

    salt_hash_hexstr = hashlib.sha1(urandom(16)).hexdigest()
    email_hash_hexstr = hashlib.sha1(auth_data["email"].encode('utf-8')).hexdigest()
    cat_str = salt_hash_hexstr + email_hash_hexstr
    activation_key = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()

    verification = Verification()
    verification.user = user
    verification.activation_key = activation_key
    verification.key_expires = timezone.now() + datetime.timedelta(days=2)
    verification.save()

    message = get_template('registration/verification_mail.html').render({
        'key': activation_key,
        'email': user.email,
        **registration_context(),
    })

    msg = EmailMessage(strings.SIGN_UP_SUBJECT, message, to=(user.email,))
    msg.content_subtype = 'html'

    if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
        msg.send()
        _logger.info("verification email sent to user : %s", user.email)
    else:
        _logger.info("verification email disabled. skipping email for user : %s", user.email)
        _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)

    response = {'detail': 'Client Registered Successfully. Please Check Email for verification'}
    status = 200
    return response, status
    
def authenticate(username=None,password=None):
    u = username.strip()
    p = password.strip()
    try:
        if u.isnumeric() and len(u) is 10:
            user = MPClientProfileInfo.objects.get(mobile_number__iexact=u).user
        else:
            user = User.objects.get(email__iexact=u)
        if not user.groups.filter(name=GROUP_NAME_CLIENT).exists():
            return None
    except (MPClientProfileInfo.DoesNotExist,User.DoesNotExist) as e:
        return None
    if user.check_password(p):
        return user
    else:
        return None

def log_in_market_place(data):
    username = data.get("username")
    password = data.get("password")
    user = authenticate(username,password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        
        result = market_place_api.get_client_dashboard_data(user.id)
        response = {'detail': 'Login Successfully', 'token': token.key, 'client_dashboard_data': result}
        status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
    return response, status
    
    