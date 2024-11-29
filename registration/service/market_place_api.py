import logging
from django.db.transaction import atomic
import random
from django.contrib.sessions.backends.db import SessionStore
from django.conf import settings
from django.core.validators import validate_email
from registration.service import client_mobile_number_service
import hashlib
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import login, logout ,authenticate
from os import urandom
from guardian.shortcuts import assign_perm
import datetime
from django.utils import timezone
from django.core.mail import EmailMessage
import strings
from kronos.exceptions import AppLogicError,ObjectNotFound
from rest_framework.authtoken.models import Token
from django.forms import ValidationError
from django.contrib.auth.models import User, Group,Permission
from django.db.models import Q
from client.models import MPClientProfileInfo,ClientManager,ClientTrainer,Client,ClientUser,MPOrder,Store
from registration.models import GROUP_NAME_CLIENT,Verification,OTPVerification
from django.db import IntegrityError
from auditor.service import profile_info_service,market_place_api
from django.template.loader import get_template
from registration.context import registration_context

_logger = logging.getLogger(__name__)



def generate_otp():
    return str(random.randint(1000, 9999))

def create_client_manager_and_trainer(user_id):
    try:
        user = User.objects.get(id=user_id)
        email= user.email
        try:
            client = Client.objects.get(name=email) 
        except Client.DoesNotExist as e:
            client=Client()
            client.name=email
            client.email=email
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
            
            
            if ClientTrainer.objects.filter(client=client, user__email='mohna.floorwalk@gmail.com').exists():
                raise AppLogicError("a trainer is already exists in this client")
            else:
                trainer = User.objects.get(email='mohna.floorwalk@gmail.com')
                
                client_trainer = ClientTrainer()
                client_trainer.client = client
                client_trainer.user = trainer
                client_trainer.receive_email_notification = True
                client_trainer.is_active = True
                client_trainer.save()
    except User.DoesNotExist as e:
        ObjectNotFound()
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
    try:
        user = User.objects.get(email__iexact=to_check_email)
        group_name = user.groups.get()
        if group_name.name!="Client":
            response={'details': 'User is Already Registered as a {}!! Please use Alternate Email'.format(group_name.name)}
            status= 200
        else:
            response={'details': 'User is Already Registered !! Please Login'}
            status=200
    except:
        user=User()
        user.email = request.data.get("username")
        user.first_name = request.data.get("first_name")
        user.brand = request.data.get("brand")
        # if request.data.get("phone"):
        #     user.mobile = request.data.get("phone")
        if request.data.get("phone"):
            user.phone = request.data.get("phone")
        if request.data.get("last_name"):
            user.last_name = request.data.get("last_name")
        user.username = str.lower(request.data.get("username"))
        user.set_password(request.data.get("password"))
        user.is_active = False
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
        user.save()
       
        if request.data.get("phone") or request.data.get("last_name"):
            client_profile = MPClientProfileInfo(user_id=user.id,mobile_number=request.data.get("phone"),first_name=user.first_name,last_name=request.data.get("last_name"),brand=user.brand)

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

        response = {'detail': 'Client Registered Successfully. Please Check Email for OTP Verification...','user':user.id,'email':user.email}
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

def log_in_market_place(request):
    username = request.data.get("username")
    password = request.data.get("password")
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
            
            response={'details': 'OTP is Shared On Your Email !!','user':user.id,'email':user.email}
            status= 200
        else:
            login(request,user,backend='registration.backend.CaseInsensitiveModelBackend1')
            token, created = Token.objects.get_or_create(user=user)
            result = market_place_api.get_client_dashboard_data(user.id)
            response = {'detail': 'Login Successfully','token':token.key,'client_dashboard_data': result}
            status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
    return response, status

@atomic
def web_login_api(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        try:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            token, created = Token.objects.get_or_create(user=user)
            # client_dashboard_data = market_place_api.get_client_dashboard_data(user)
            client = Client.objects.get(email=user.email)
            response = {
                'detail': 'Login successful',
                'token': token.key,
                'username': user.username,
                'user_id' : user.id,
                'client_id' : client.id,
                'client_name' : client.name,
                # 'client_dashboard_data': client_dashboard_data,
            }
            status = 200
        except Exception as e:
            response = {'detail': f'Error during login: {str(e)}'}
            status = 500
    else:
        response = {'detail': 'Invalid username or password'}
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
            
            response={'detail': 'Old OTP Has Expired, New OTP is Shared On Your Email !!','user':user }
            status= 200
        else:
            if otp_verification.otp == otp:
                user_=User.objects.get(id=user)
                user_.is_active = True
                user_.save()
                otp_verification.is_verified = True
                otp_verification.save()
                login(request,user_,backend='registration.backend.CaseInsensitiveModelBackend1')
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

@atomic
def change_password(user_id,old_password,new_password):
    user = User.objects.get(pk=user_id)
    if not user.check_password(old_password):
        raise AppLogicError("Old password is incorrect")
    user.set_password(new_password)
    user.save()
    return {'detail': 'Password changed'}

@atomic
def forgot_password(request):
    to_check_email = request.get('email')
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'details': 'Please enter a valid email'}
        status = 400
    else:
        if to_check_email:
            to_check_email = to_check_email.strip().lower()

        try:
            user = User.objects.get(email__iexact=to_check_email)
            group_name = user.groups.get()
            if group_name.name == "Client":
                otp = generate_otp()
                otp_verification = OTPVerification.objects.get(user=user)
                otp_verification.otp = otp
                otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
                otp_verification.save()
                message = get_template('registration/market_place/forgot_password_otp_verification.html').render({
                    'otp': otp,
                    'email': user.email,
                    **registration_context(),
                })

                msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user.email,))
                msg.content_subtype = 'html'

                if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
                    msg.send()
                    _logger.info("forgot password email sent to user: %s", user.email)
                else:
                    _logger.info("forgot password email disabled. skipping email for user: %s", user.email)
                    _logger.debug("DUMPING VERIFICATION EMAIL: %s", message)

                response = {'details': 'OTP is Sent In Your Registered Mail !! ', 'user': user.id}
                status = 200
            if group_name.name!="Client":
                response={'details': 'Email is Registered as a {}!! Please use Client Account Email'.format(group_name.name)}
                status= 200
        except User.DoesNotExist:
            response = {'details': 'Email ID does not Exist please Enter Valide Email ID'}
            status = 404

    _logger.info("Response: %s", response)
    _logger.info("Status: %s", status)

    return response, status

@atomic
def verify_otp_for_forgot_password(request):
    otp = request.get('otp') 
    user = request.get('user')
    try:
        user_=User.objects.get(id=user) 
        otp_verification = OTPVerification.objects.get(user=user_.id)
        
        if otp_verification.is_expired():
            otp = generate_otp()
            otp_verification=OTPVerification.objects.get(user_id=user_.id)
            otp_verification.otp = otp
            otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
            otp_verification.save()
            message = get_template('registration/market_place/forgot_password_otp_verification.html').render({
                'otp': otp,
                'email': user_.email,
                **registration_context(),
            })

            msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user_.email,))
            msg.content_subtype = 'html'

            if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
                msg.send()
                _logger.info("forgot password email sent to user : %s", user_.email)
            else:
                _logger.info("forgot password email disabled. skipping email for user : %s", user_.email)
                _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)
            
            response={'detail': 'Old OTP Has Expired, New OTP is Shared On Your Email !!','user':user }
            status= 200

        else:
            if otp_verification.otp == otp:
                user_=User.objects.get(id=user)
                otp_verification.is_verified = True
                otp_verification.save()
                token, created = Token.objects.get_or_create(user=user_)
                response = {'detail': 'OTP Verified !! Please Change Password', 'token': token.key,'user':user_.id}
                status = 200
            
            else:
                response = {'detail': 'Invalid OTP.'}
                status = 400
    except OTPVerification.DoesNotExist:
        response = {'detail': 'Record not found.'}
        status = 404
    
    return response,status

@atomic
def set_password(request):
    user=request.user.id
    password= request.data.get('password')
    user = User.objects.get(pk=user)
    user.set_password(password)
    user.save()
    response={'detail': 'Password Changed'}
    status=200
    return response,status