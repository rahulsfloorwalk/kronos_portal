import logging
from django.db.transaction import atomic
import random
from django.contrib.sessions.backends.db import SessionStore
from django.conf import settings
from django.core.validators import validate_email
from registration.service import client_mobile_number_service
import hashlib
from os import urandom
from guardian.shortcuts import assign_perm
import datetime
from django.utils import timezone
from django.core.mail import EmailMessage
import strings
from kronos.exceptions import AppLogicError
from rest_framework.authtoken.models import Token
from django.forms import ValidationError
from django.contrib.auth.models import User, Group
from django.db.models import Q
from client.models import MPClientProfileInfo,ClientManager,ClientTrainer,Client,ClientUser
from registration.models import GROUP_NAME_CLIENT,Verification,OTPVerification
from django.db import IntegrityError
from auditor.service import profile_info_service,market_place_api
from django.template.loader import get_template
from registration.context import registration_context

_logger = logging.getLogger(__name__)

def generate_otp():
    return random.randint(1000, 9999)

def sign_up_market_place(request):
    to_check_email = request.data.get("username")
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'detail':'Please enter a valid email'}
        status = 400
        return response,status
    if to_check_email:
        to_check_email = to_check_email.strip().lower()
    
    if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email) ).exists():
        response={'detail':'a user with this email already exists, please check email for otp'}
        status= 200
        return response,status
    
    user=User()
    user.email = request.data.get("username")
    if request.data.get("phone"):
        user.phone = request.data.get("phone")
    user.username = str.lower(request.data.get("username"))
    user.set_password(request.data.get("password"))
    user.is_active = False
    
    user.save()
    user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
    user.save()
    
    client=Client()
    client.name=request.data.get("username")
    client.email=request.data.get("username")
    client.is_active = False 
    client.save()
    
    client_user = ClientUser()
    client_user.client = client
    client_user.full_name = " . "
    client_user.user = user
    client_user.receive_email_notification = True
    client_user.save()
    assign_perm('client.clientuser_admin',user)
    
    if ClientManager.objects.filter(client=client,user__email='sourabh@floorwalk.in').exists():
        raise AppLogicError("a manager is already exists in this client")
    else:
        manager = User.objects.get(email='sourabh@floorwalk.in')
        
        client_manager = ClientManager()
        client_manager.client = client
        client_manager.user = manager
        client_manager.receive_email_notification = True
        client_manager.is_active = True
        client_manager.save()
    
    
    if ClientTrainer.objects.filter(client=client, user__email='bhagyashree.khade@floorwalk.in').exists():
        raise AppLogicError("a trainer is already exists in this client")
    else:
        trainer = User.objects.get(email='bhagyashree.khade@floorwalk.in')
        
        client_trainer = ClientTrainer()
        client_trainer.client = client
        client_trainer.user = trainer
        client_trainer.receive_email_notification = True
        client_trainer.is_active = True
        client_trainer.save()
    
    
    if request.data.get("phone"):
        client_profile = MPClientProfileInfo(user_id=user.id,mobile_number=user.phone)
    else:
        client_profile = MPClientProfileInfo(user_id=user.id)
    client_profile.save()
    
    auth_data = {}
    auth_data['email'] = request.data.get("username")
    
    
    otp = generate_otp()
    otp_verification=OTPVerification()
    otp_verification.user = user
    otp_verification.otp=otp
    otp_verification.save()
    
    message = get_template('registration/market_place/otp_verification.html').render({
        'otp': otp,
        'email': user.email,
        **registration_context(),
    })

    msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user.email,))
    msg.content_subtype = 'html'

    if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
        msg.send()
        _logger.info("verification email sent to user : %s", user.email)
    else:
        _logger.info("verification email disabled. skipping email for user : %s", user.email)
        _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)

    response = {'detail': 'Client Registered Successfully. Please Check Email for OTP Verification'}
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
        if not user.otpverification.is_verified:
            response = {'detail': 'Your account is not verified. Please check your email for the OTP.'}
            status = 200
        else:
            OTPVerification.objects.filter(user_id=user.id).update(otp="")
            token, created = Token.objects.get_or_create(user=user)

            result = market_place_api.get_client_dashboard_data(user.id)
            response = {'detail': 'Login Successfully', 'token': token.key, 'client_dashboard_data': result}
            status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
    return response, status

# def verify_by_otp_and_login(request):
#     user_otp = request.data.get('otp')
#     otp = request.session.get('otp')
#     if otp == user_otp:
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(username,password)
#         user.is_active=True
#         user.save()
#         client_user = ClientUser.objects.get(user_id=user.id)
#         client_user.user=user
#         client_user.save()
#         if user:
#             token, created = Token.objects.get_or_create(user=user)
#             result = market_place_api.get_client_dashboard_data(user.id)
#             response = {'detail': 'Login Successfully', 'token': token.key, 'client_dashboard_data': result}
#             status = 200
#     else:
#         response = {'detail': 'OTP is incorrect'}
#         status=400
#     return response,status
        
        