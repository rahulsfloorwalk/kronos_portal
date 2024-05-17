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
from os import urandom
import random
import datetime
from django.utils import timezone
from django.template.loader import get_template
from django.core.mail import EmailMessage
import strings
from django.forms import ValidationError
from django.db.models import Q
from rest_framework.authtoken.models import Token
from auditor.models import ProfileInfo, AdditionalInfo
from registration.models import GROUP_NAME_AUDITOR,Verification,OTPVerification
from django.db import IntegrityError
from registration.service.auditor import generate_ref_code
from registration.context import registration_context
from auditor.service import auditor_api
from django.contrib.auth import login, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils.http import  urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _
from django.utils.encoding import force_bytes, force_text
from questionnaire.models import Question,Section,SectionProofTag
from answer.models import Answer
from audit.models import AuditCycleProofTagList
from audit_store.models import AuditStore
from answer.models import ReportSection
from attachment.models import Attachment


UserModel = get_user_model()
_logger = logging.getLogger(__name__)


def generate_otp():
    return str(random.randint(1000, 9999))

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


def get_auditor_dashboard_data_for_app(user_id):
    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)

    if profile_info is not None and profile_info.first_name.strip():
        auditor_stats = stats.getAuditorStats(user_id)
        result = {
            'auditor_info': {
                'first_name': profile_info.first_name,
                'last_name': profile_info.last_name,
                'mobile_number': profile_info.mobile_number,
                'city': profile_info.city.name if profile_info.city else "",
                'email': profile_info.user.email
            },
            'auditor_stats': auditor_stats
        }
        return result
    else:
        return {"result": "Please fill personal information"}, 200
   
   
def get_report_completion_percentage(audit_store_id):
    audit_store = AuditStore.objects.get(id=audit_store_id)
    audit_cycle = audit_store.audit.audit_cycle
    questions = Question.objects.filter(section__audit_cycle=audit_cycle)

    total_questions_count = 0 
    attended_questions_count = 0

    sections = Section.objects.filter(audit_cycle=audit_cycle, hide_comment=False)
    total_questions_count = len(questions) + sections.count() + 1 # Considering report_summary as one point

    proof_tags = AuditCycleProofTagList.objects.filter(audit_cycle=audit_cycle)

    if audit_store.report_summary is not None and audit_store.report_summary.strip() != '':
        attended_questions_count += 1  

    if proof_tags.exists():
        audit_cycle_proof_tags = proof_tags
        if audit_cycle_proof_tags.exists():
            proof = SectionProofTag.objects.filter(audit_cycle_proof_tag__in=audit_cycle_proof_tags, is_required=True)
            if proof.exists():
                total_questions_count += proof.count()
                
                section_ids = proof.values_list('section__id', flat=True)
                
                section_proof_tags = SectionProofTag.objects.filter(section__id__in=section_ids, audit_cycle_proof_tag__in=audit_cycle_proof_tags)
                
                section_attachments = Attachment.objects.filter(
                proof_tag__section_proof_tag__in=section_proof_tags,
                status=Attachment.ATTACHED,
                audit_stores__id=audit_store_id
                ).distinct('proof_tag')
                if section_attachments.exists():
                    attended_questions_count += len(section_attachments)

    for section in sections:
        report_sections = ReportSection.objects.filter(section=section, audit_store=audit_store_id)
        for report_section in report_sections:
            if report_section.auditor_comment is not None and report_section.auditor_comment.strip():
                attended_questions_count += 1

    for question in questions:
        queryset = Answer.objects.filter(question=question, audit_store=audit_store_id)
        if question.optional_comment_required and question.question_type == 'MUTEX':
            if queryset.exists() and queryset.first().answer_comment:
                attended_questions_count += 1
        elif queryset.exists():
            attended_questions_count += 1
    report_completion_percentage = int((attended_questions_count / total_questions_count) * 100)

    return (report_completion_percentage)

   
# def get_section_completion_status(audit_store_id, question_id):
#     question = Question.objects.get(id=question_id)
#     questions = Question.objects.filter(section_id=question.section.id)
#     report_section = ReportSection.objects.get(section=question.section.id, audit_store=audit_store_id)

#     section = Section.objects.get(id=question.section.id)

#     proof_tags = AuditCycleProofTagList.objects.filter(audit_cycle=section__audit_cycle)


#     question_ids = set(questions.values_list('id', flat=True))

#     # Check if all questions with optional comments have non-empty answer comments
#     for question_id in question_ids:
#         question_obj = Question.objects.filter(id=question_id, optional_comment_required=True).first()
#         if question_obj:
#             answered_question = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).first()
#             if not answered_question or not answered_question.answer_comment.strip():
#                 return False
#         else:
#             answered_question_ids = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).values_list('question_id', flat=True)
#             if question_id not in answered_question_ids:
#                 return False 
#             answered_question = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).first()
#             if answered_question.answer_text is None or answered_question.answer_text.strip() == '':
#                 return False

#     return True
   
   
# def get_section_summary_status(audit_store_id, section_id):
    
#     question = Question.objects.get(id=question_id)
#     questions = Question.objects.filter(section_id=question.section.id)
#     report_section = ReportSection.objects.get(section=question.section.id,audit_store = audit_store_id)

#     section = Section.objects.get(id=question.section.id)

#     question_ids = set(questions.values_list('id', flat=True))

#     # Check if all questions with optional comments have non-empty answer comments
#     for question_id in question_ids:
#         question_obj = Question.objects.filter(id=question_id, optional_comment_required=True).first()
#         if question_obj:
#             answered_question = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).first()
#             if not answered_question or not answered_question.answer_comment.strip():
#                 return False
#         else:
#             answered_question_ids = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).values_list('question_id', flat=True)
#             if question_id not in answered_question_ids:
#                 return False 
#             answered_question = Answer.objects.filter(question_id=question_id, audit_store_id=audit_store_id).first()
#             if answered_question.answer_text is None or answered_question.answer_text.strip() == '':
#                 return False

            
#     # Check if auditor_comment is filled for ReportSection related to the questions
#     if section.hide_comment == False:
#         if not report_section.auditor_comment or not report_section.auditor_comment.strip():
#             return False  # Auditor comment is required but not provided
#     return True

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

            if group_name.name == "Auditor":
                # otp = generate_otp()
                # otp_verification = OTPVerification.objects.get(user=user)
                # otp_verification.otp = otp
                # otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
                # otp_verification.save()
                # message = get_template('registration/market_place/forgot_password_otp_verification.html').render({
                #     'otp': otp,
                #     'email': user.email,
                #     **registration_context(),
                # })

                otp_verification, created = OTPVerification.objects.get_or_create(
                    user=user,
                    defaults={'otp': generate_otp(), 'otp_expires': timezone.now() + datetime.timedelta(minutes=5)}
                )
                message = get_template('registration/market_place/forgot_password_otp_verification.html').render({
                    'otp': otp_verification.otp,
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
            if group_name.name != "Auditor":
                response = {'details': 'Email is Registered as a {}!! Please use Auditor Account Email'.format(group_name.name)}
                status = 200
        except User.DoesNotExist:
            response = {'details': 'Email ID does not Exist please Enter Valid Email ID'}
            status = 404

    _logger.info("Response: %s", response)
    _logger.info("Status: %s", status)

    return response, status


# @atomic
# def forgot_password(request):
#     to_check_email = request.get("email")
#     try:
#         validate_email(to_check_email)
#     except ValidationError:
#         response = {'detail': 'Please enter a valid email'}
#         status = 400
#         return response, status
    
#     else:
#         if to_check_email:
#             to_check_email = to_check_email.strip().lower()
#         try:
#             user = User.objects.get(email__iexact=to_check_email)
#             group_name = user.groups.get()

#             if group_name.name == "Auditor":
#                 # Generate verification key
#                 salt_hash_hexstr = hashlib.sha1(urandom(16)).hexdigest()
#                 email_hash_hexstr = hashlib.sha1(user.email.encode('utf-8')).hexdigest()
#                 cat_str = salt_hash_hexstr + email_hash_hexstr
#                 activation_key = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()

#                 # Save the verification key and expiration time
#                 verification, created = Verification.objects.get_or_create(user=user)
#                 verification.activation_key = activation_key
#                 verification.key_expires = timezone.now() + timezone.timedelta(days=2)
#                 verification.save()

#                 # Generate reset link
#                 uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
#                 token = default_token_generator.make_token(user)
#                 reset_url = reverse('auditor:password_reset_confirm', args=[uidb64, token])
#                 context = {
#                     'email': user.email,
#                     'reset_url': reset_url,
#                     **registration_context(),
#                 }
#                 message = get_template('registration/auditor_app/forgot_password_otp_verification.html').render(context)

#                 # Send password reset email
#                 # subject = 'Password Reset'
#                 # from_email = settings.DEFAULT_FROM_EMAIL
#                 # to_email = [user.email]

#                 # send_mail(subject, message, from_email, to_email, fail_silently=False)

#                 msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user.email,))
#                 msg.content_subtype = 'html'
#                 if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
#                     msg.send()
#                     _logger.info("Password reset email sent to user: %s", user.email)
#                 else:
#                     _logger.info("Password reset email disabled. Skipping email for user: %s", user.email)
#                     _logger.debug("DUMPING PASSWORD RESET EMAIL: %s", message)

#                 response = {'detail': 'Password reset instructions sent to your email','user': user.id}
#                 status = 200
#             elif group_name.name != "Auditor":
#                 response = {'detail': 'Email is Registered as a {}!! Please use Client Account Email'.format(group_name.name)}
#                 status = 200
#         except User.DoesNotExist:
#             response = {'detail': 'Email ID does not Exist. Please Enter a Valid Email ID'}
#             status = 404
#     _logger.info("Response: %s", response)
#     _logger.info("Status: %s", status)
#     return response, status

def password_reset_confirm(request, uidb64, token):
    # Extract necessary information from the request object
    uid = force_text(urlsafe_base64_decode(uidb64))
    try:
        user = UserModel._default_manager.get(pk=uid)
    except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        # user = request.user.id
        password = request.data.get('password')
        user = User.objects.get(pk=user.id)  # Get the user object from the user ID
        user.set_password(password)
        user.save()
        response = {'detail': 'Password Changed'}
        status = 200
        return response, status
    else:
        response = {'detail': 'Invalid token or user not found'}
        status = 400

    return response, status


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


def sign_up_auditor_app(request):
    # to_check_email = request.POST.get("username")
    to_check_email = request.data.get("username")
    try:
        validate_email(to_check_email)
    except ValidationError:
        response = {'detail': 'Please enter a valid email'}
        status = 400
        return response, status

    if to_check_email:
        to_check_email = to_check_email.strip().lower()
    
    if not len(request.data.get("phone")) == 10:
        response = {'detail': 'Phone number should be 10 digit'}
        status = 400
        return response, status

    if request.GET.get("referred_by"):
        if not AdditionalInfo.objects.filter(referral_code=request.data.get("referred_by").lower()).exists():
            response = {'detail': 'a user with this referral code does not exist. Please enter valid referral code or leave blank.'}
            status = 400
            return response, status

    if not profile_info_service.mobile_number_pattern.match(request.data.get("phone")):
        response = {'detail': 'invalid phone number'}
        status = 400
        return response, status

    if mobile_number_service.mobile_number_exists(request.data.get("phone")):
        response = {'detail': 'a user with this phone number already exists'}
        status = 400
        return response, status

    try:
        user = User.objects.get(email__iexact=to_check_email)
        group_name = user.groups.get()
        if group_name.name != "Auditor":
            response = {'details': 'User is Already Registered as a {}!! Please use Alternate Email'.format(group_name.name)}
            status = 200
        else:
            response = {'details': 'User is Already Registered !! Please Login'}
            status = 200
        profile_info = ProfileInfo.objects.get(user=user)
    except User.DoesNotExist:
        user = User()
        user.email = request.data.get("username")
        user.phone = request.data.get("phone")
        user.username = str.lower(request.data.get("username"))
        user.set_password(request.data.get("password"))
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        user.save()

        profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
        profile_info.save()

        # Move the creation of profile_info above this point
        additional_info = AdditionalInfo(user_id=user.id)
        additional_info.referred_by = request.GET.get("referred_by")
        additional_info.save()

        prefs = Preferences(user_id=user.id)
        prefs.agreement_accepted = True
        prefs.pp_accepted = True
        prefs.save()

    # Move this block below the creation of profile_info
    try:
        additional_info = AdditionalInfo.objects.get(user=user)
        additional_info.referral_code = generate_ref_code(user.email, profile_info.mobile_number)
        additional_info.save()
    except IntegrityError:
        _logger.error("Collision for referral code unresolved for user %s. Skipping generation of referral code",
                      user.email)
        pass

    auth_data = {}
    auth_data['email'] = request.data.get("username")

    otp = generate_otp()
    otp_verification = OTPVerification()
    otp_verification.user = user
    otp_verification.otp = otp
    otp_verification.otp_expires = timezone.now() + datetime.timedelta(minutes=5)
    otp_verification.save()
    message = get_template('registration/market_place/otp_verification.html').render({
        'otp': otp,
        'email': user.email,
        **registration_context(),
    })

    
    # salt_hash_hexstr = hashlib.sha1(urandom(16)).hexdigest()
    # email_hash_hexstr = hashlib.sha1(auth_data["email"].encode('utf-8')).hexdigest()
    # cat_str = salt_hash_hexstr + email_hash_hexstr
    # activation_key = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()

    # verification = Verification()
    # verification.user = user
    # verification.activation_key = activation_key
    # verification.key_expires = timezone.now() + datetime.timedelta(days=2)
    # verification.save()

    # message = get_template('registration/verification_mail.html').render({
    #     'key': activation_key,
    #     'email': user.email,
    #     **registration_context(),
    # })

    msg = EmailMessage(strings.SIGN_UP_CLIENT_SUBJECT, message, to=(user.email,))
    msg.content_subtype = 'html'

    if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
        msg.send()
        _logger.info("verification email sent to user : %s", user.email)
    else:
        _logger.info("verification email disabled. skipping email for user : %s", user.email)
        _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)

    response = {'detail': 'Auditor Registered Successfully. Please Check Email for OTP Verification...', 'user': user.id, 'email': user.email}
    status = 200
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
                # create_client_manager_and_trainer(user)
                token, created = Token.objects.get_or_create(user=user_)
                # result = market_place_api.get_client_dashboard_data(user_.id)
                response = {'detail': 'OTP Verified !! Login Successfully', 'token': token.key}
                status = 200
            
            else:
                response = {'detail': 'Invalid OTP.'}
                status = 400
    except OTPVerification.DoesNotExist:
        response = {'detail': 'Record not found.'}
        status = 404
    
    return response,status



def sign_up_auditor(request):
    to_check_email = request.POST.get("username")
    # for key, value in request.POST.items():
    #     print(f"{key}: {value}")
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
        # profile_info = ProfileInfo.objects.get(user=user)

    # if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
    #     response = {'detail': 'a user with this email already exists'}
    #     status = 400
    #     return response, status
    except User.DoesNotExist:
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
        additional_info = AdditionalInfo.objects.get(user=user)
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

            result = auditor_api.get_auditor_dashboard_data_for_app(user.id)
            response = {'detail': 'Login Successfully', 'token': token.key, 'auditor_dashboard_data': result}
            status = 200
    else:
        response = {'detail': 'Username or Password incorrect'}
        status = 400
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
