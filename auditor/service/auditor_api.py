from django.contrib.auth.models import User, Group
from kronos.exceptions import AppLogicError
from django.db.transaction import atomic
from auditor.service import profile_info_service
from auditor.service import stats
import logging
from django.conf import settings
from django.core.validators import validate_email
from registration.service import mobile_number_service
from auditor.models import Preferences
import hashlib
from registration.models import Verification
from os import urandom
import datetime
from django.utils import timezone
from django.template.loader import get_template
from django.core.mail import EmailMessage
import strings
from django.forms import ValidationError
from django.db.models import Q
from rest_framework.authtoken.models import Token
from auditor.models import ProfileInfo, AdditionalInfo
from registration.models import GROUP_NAME_AUDITOR
from django.db import IntegrityError
from registration.service.auditor import generate_ref_code
from registration.context import registration_context
from auditor.service import auditor_api
from django.contrib.auth import login, logout

_logger = logging.getLogger(__name__)


@atomic
def change_password(user_id, old_password, new_password):
    user = User.objects.get(pk=user_id)
    if not user.check_password(old_password):
        raise AppLogicError("Old password is incorrect")
    user.set_password(new_password)
    user.save()
    return {'detail': 'Password changed'}


def get_auditor_dashboard_data(user_id):
    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
    auditor_stats = stats.getAuditorStats(user_id)
    result = {
        'auditor_info':
            {
                'first_name': profile_info.first_name,
                'last_name': profile_info.last_name,
                'mobile_number': profile_info.mobile_number,
                'city': profile_info.city.name if profile_info.city else "",
                'email': profile_info.user.email
            },
        'auditor_stats': auditor_stats
    }
    return result


def sign_up_auditor(request):
    to_check_email = request.POST.get("username")
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'detail': 'Please enter a valid email'}
        status = 400
        return response, status

    if to_check_email:
        to_check_email = to_check_email.strip().lower()

    if not len(request.POST.get("phone")) == 10:
        response = {'detail': 'Phone number should be 10 digit'}
        status = 400
        return response, status

    if request.GET.get("referred_by"):
        if not AdditionalInfo.objects.filter(referral_code=request.POST.get("referred_by").lower()).exists():
            response = {'detail': 'a user with this referral code does not exist. Please enter valid referral code or leave blank.'}
            status = 400
            return response, status
        
    if not profile_info_service.mobile_number_pattern.match(request.POST.get("phone")):
        response = {'detail': 'invalid phone number'}
        status = 400
        return response, status

    if mobile_number_service.mobile_number_exists(request.POST.get("phone")):
        response = {'detail': 'a user with this phone number already exists'}
        status = 400
        return response, status

    try :
        user = User.objects.get(email__iexact=to_check_email)
        group_name = user.groups.get()
        if group_name.name!="Auditor":
            response={'details': 'User is Already Registered as a {}!! Please use Alternate Email'.format(group_name.name)}
            status= 200
        else:
            response={'details': 'User is Already Registered !! Please Login'}
            status=200

    # if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
    #     response = {'detail': 'a user with this email already exists'}
    #     status = 400
    #     return response, status
    except:
        user = User()
        user.email = request.POST.get("username")
        user.phone = request.POST.get("phone")
        user.username = str.lower(request.POST.get("username"))
        user.set_password(request.POST.get("password"))
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        user.save()

        profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
        profile_info.save()

        additional_info = AdditionalInfo(user_id=user.id)
        additional_info.referred_by = request.GET.get("referred_by")
        additional_info.save()

        prefs = Preferences(user_id=user.id)
        prefs.agreement_accepted = True
        prefs.pp_accepted = True
        prefs.save()

    try:
        additional_info.referral_code = generate_ref_code(user.email, profile_info.mobile_number)
        additional_info.save()
    except IntegrityError:
        _logger.error("Collision for referral code unresolved for user %s. Skipping generation of referral code",
                      user.email)
        pass

    auth_data = {}
    auth_data['email'] = request.POST.get("username")

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

    response = {'detail': 'User Registered Successfully. Please Check Email for verification'}
    status = 200
    return response, status


def authenticate(username=None, password=None):
    u = username.strip()
    p = password.strip()
    try:
        if u.isnumeric() and len(u) is 10:
            # logger.debug("username is numeric")
            user = ProfileInfo.objects.get(mobile_number__iexact=u).user
        else:
            # logger.debug("username is NOT numeric")
            user = User.objects.get(email__iexact=u)

        if not user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            return None

    except (ProfileInfo.DoesNotExist, User.DoesNotExist) as e:
        # logger.debug("User or Profile not found for username: %s", username)
        return None

    if user.check_password(p):
        # logger.debug("successfully authenticated: %s", username)
        return user
    else:
        # logger.debug("password check failed for: %s", username)
        return None


def login_auditor(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username, password)
    if user:
        if not user.verification.is_verified:
            response = {'detail': 'Your account is not verified. Please check your email for the verification link.'}
            status = 400
        else:
            login(request,user,backend='registration.backend.CaseInsensitiveModelBackend1')
            token, created = Token.objects.get_or_create(user=user)

            result = auditor_api.get_auditor_dashboard_data(user.id)
            response = {'detail': 'Login Successfully', 'token': token.key, 'auditor_dashboard_data': result}
            status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
    return response, status