from os import urandom
import logging
import hashlib
import datetime

from django.conf import settings
from django import forms
from django.contrib.auth.models import User,Group
from django.core.validators import validate_email
from registration.models import Verification
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from auditor.models import ProfileInfo, AdditionalInfo
from django.utils import timezone
from django.db.models import Q
from django.db import IntegrityError
from django.template.loader import get_template
from django.core.mail import EmailMessage

import strings
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_AGENCY
from registration.service.auditor import generate_ref_code
from auditor.validators import numericValidator
from registration.context import registration_context
from auditor.models import Preferences
from registration.service import mobile_number_service
from payment.service.payment_beneficiary import create_beneficiary_id_for_user

_logger = logging.getLogger(__name__)

class SignUpForm(UserCreationForm):
    phone = forms.CharField(min_length=10, max_length=10, required = True, validators=[numericValidator])
    referred_by = forms.CharField(required=False, label='Referral Code (optional)')
    tos_accept = forms.BooleanField(required=True, label='Privacy Policy')

    class Meta:
        model = User
        fields = ("username", "phone", "password1", "password2")

    def clean_username(self):
        to_check_email = self.cleaned_data["username"]

        validate_email(to_check_email)

        if to_check_email:
            to_check_email = to_check_email.strip().lower()

        if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
            raise ValidationError("a user with email %(email)s already exists", params={"email": to_check_email})

        return to_check_email

    def clean_phone(self):

        if mobile_number_service.mobile_number_exists(self.cleaned_data["phone"]):
            raise ValidationError("a user with phone %(phone)s already exists", params={"phone": self.cleaned_data["phone"]})

        return self.cleaned_data["phone"]

    def clean_referred_by(self):
        if self.cleaned_data.get("referred_by"):
            if not AdditionalInfo.objects.filter(referral_code=self.cleaned_data["referred_by"].lower()).exists():
                raise ValidationError("a user with referral code %(referred_by)s does not exist. Please enter valid referral code or leave blank.", params={"referred_by": self.cleaned_data["referred_by"]})

        return self.cleaned_data["referred_by"]

    def save(self, commit = True):
        user = super(SignUpForm, self).save(commit = False)
        user.email = self.cleaned_data["username"]
        user.phone = self.cleaned_data["phone"]
        user.username = str.lower(self.cleaned_data["username"])
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        user.save()

        profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
        profile_info.save()

        additional_info = AdditionalInfo(user_id=user.id)
        additional_info.referred_by = self.cleaned_data["referred_by"]
        additional_info.save()

        create_beneficiary_id_for_user(user)

        prefs = Preferences(user_id=user.id)
        prefs.agreement_accepted = True
        prefs.pp_accepted = True
        prefs.save()

        try:
            additional_info.referral_code = generate_ref_code(user.email, profile_info.mobile_number)
            additional_info.save()
        except IntegrityError:
            _logger.error("Collision for referral code unresolved for user %s. Skipping generation of referral code", user.email)
            pass

        auth_data = {}
        auth_data['email'] = self.cleaned_data['username']

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

        return user


class GroupAuthenticationForm(AuthenticationForm):
    def __init__(self, group_name, *args, **kwargs):
        super(GroupAuthenticationForm, self).__init__(*args, **kwargs)
        self.group_name = group_name

    def is_valid(self):
        valid = super(AuthenticationForm, self).is_valid()

        if not valid or not self.user_cache:
            return valid

        if not self.user_cache.groups.filter(name=self.group_name).exists():
            self.add_error(None, "username and password do not match".format())
            valid = False

        return valid


class AuditorAuthenticationForm(GroupAuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(AuditorAuthenticationForm, self).__init__(GROUP_NAME_AUDITOR, *args, **kwargs)

    def is_valid(self):
        valid = super(AuditorAuthenticationForm, self).is_valid()

        if not valid or not self.user_cache:
            return valid

        try:
            if not self.user_cache.verification.is_verified:
                self.add_error(None, "Your account is not verified. Please check your email for the verification link.")
                valid = False
        except Verification.DoesNotExist:
            _logger.warn("User without verification found! : %s", self.user_cache)
            self.add_error(None, "Your account is not verified. Please check your email for the verification link.")
            valid = False

        return valid


class AgencyAuthenticationForm(GroupAuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(AgencyAuthenticationForm, self).__init__(GROUP_NAME_AGENCY, *args, **kwargs)

    def is_valid(self):
        valid = super(AgencyAuthenticationForm, self).is_valid()

        if not valid or not self.user_cache:
            return valid

        try:
            if not self.user_cache.verification.is_verified:
                self.add_error(None, "Your account is not verified. Please check your email for the verification link.")
                valid = False
        except Verification.DoesNotExist:
            _logger.warn("User without verification found! : %s", self.user_cache)
            self.add_error(None, "Your account is not verified. Please check your email for the verification link.")
            valid = False

        return valid
