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
    return str(random.randint(1000, 9999))

def create_client_manager_and_trainer(user):
    return True
    
def sign_up_market_place(request):
    to_check_email = request.data.get("username")
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'detail':'Please enter a valid email'}
        status = 400
    if to_check_email:
        to_check_email = to_check_email.strip().lower()
    
    user = User.objects.filter(email__iexact=to_check_email,is_active=False)
    if user:
        otp = generate_otp()
        otp_verification=OTPVerification.objects.get(user_id=user.id)
        otp_verification.otp = otp
        otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
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
        
        response={'details': 'OTP is Shared On Your Email !!','user':user.id }
        status= 200
    else:
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
        otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
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

        response = {'detail': 'Client Registered Successfully. Please Check Email for OTP Verification...','user':user.id}
        status = 200
    return response, status
    
def authenticate(username=None,password=None):
    u = username.strip()
    p = password.strip()
    try:    
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
            otp = generate_otp()
            otp_verification=OTPVerification.objects.get(user_id=user.id)
            otp_verification.otp = otp
            otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
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
            
            response={'details': 'OTP is Shared On Your Email !!','user':user.id }
            status= 200
        else:
            create_client_manager_and_trainer(user)
            token, created = Token.objects.get_or_create(user=user)

            result = market_place_api.get_client_dashboard_data(user.id)
            
            response = {'detail': 'Login Successfully', 'token': token.key, 'client_dashboard_data': result}
            status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
    return response, status

def verify_by_otp_and_login(request):
    user=request.data.get('user')
    otp=request.data.get('otp')
    try:
        
        user_=User.objects.get(id=user) 
        otp_verification = OTPVerification.objects.get(user=user_.id)
        
        if otp_verification.is_expired():
            otp = generate_otp()
            otp_verification=OTPVerification.objects.get(user_id=user_.id)
            otp_verification.otp = otp
            otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
            otp_verification.save()
            message = get_template('registration/market_place/otp_verification.html').render({
                'otp': otp,
                'email': user_.email,
                **registration_context(),
            })

            msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user_.email,))
            msg.content_subtype = 'html'

            if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
                msg.send()
                _logger.info("verification email sent to user : %s", user_.email)
            else:
                _logger.info("verification email disabled. skipping email for user : %s", user_.email)
                _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)
            
            response={'details': 'Old OTP Has Expired, New OTP is Shared On Your Email !!','user':user }
            status= 200
        else:
            if otp_verification.otp == otp:
                user_=User.objects.get(id=user)
                user_.is_active = True
                user_.save()
                otp_verification.is_verfied = True
                otp_verification.save()
                create_client_manager_and_trainer(user)
                token, created = Token.objects.get_or_create(user=user_)
                
                result = market_place_api.get_client_dashboard_data(user_.id)
                response = {'detail': 'OTP Verified !! Login Successfully', 'token': token.key, 'client_dashboard_data': result}
                status = 200
            
            else:
                response = {'detail': 'Invalid OTP.'}
                status = 400
    except OTPVerification.DoesNotExist:
        response = {'detail': 'Record not found.'}
        status = 404
    
    return response,status