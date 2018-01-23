from os import urandom
import logging
import hashlib
import datetime

from django.conf import settings
from django import forms
from django.contrib.auth.models import User,Group
from django.core.validators import validate_email
from registration.models import Verification
from django.contrib.auth.forms import UserCreationForm
from auditor.models import ProfileInfo, AdditionalInfo
from django.utils import timezone
from django.db.models import Q
from django.db import IntegrityError
from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMessage

import strings
from registration.models import GROUP_NAME_AUDITOR
from registration.service.auditor import generate_ref_code
from auditor.validators import numericValidator
from registration.context import registration_context

_logger = logging.getLogger(__name__)

class SignUpForm(UserCreationForm):
    phone = forms.CharField(min_length=10, max_length=10, required = True, validators=[numericValidator])
    referred_by = forms.CharField(required=False, label='Referral Code (optional)')

    class Meta:
        model = User
        fields = ("username", "phone", "password1", "password2")

    def is_valid(self):
        valid = super(SignUpForm, self).is_valid()
        to_check_email = self.data["username"]

        if to_check_email:
            to_check_email = to_check_email.strip().lower()

        if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
            self.add_error("username", "a user with email {} already exists".format(to_check_email))
            valid = False

        if ProfileInfo.objects.filter(mobile_number=self.data["phone"]).exists():
            self.add_error("phone", "a user with phone {} already exists".format(self.data["phone"]))
            valid = False

        if self.data.get("referred_by"):
            if not AdditionalInfo.objects.filter(referral_code=self.data["referred_by"].lower()).exists():
                self.add_error("referred_by", "a user with referral code {} does not exists. Please enter valid referral code or leave blank.".format(self.data["referred_by"]))
                valid = False

        try:
            validate_email(to_check_email)
        except forms.ValidationError as e:
            self.add_error("username", "your email is invalid")
            valid = False

        return valid

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

        message = get_template('registration/verification_mail.html').render(Context({
            'key': activation_key,
            'email': user.email,
            **registration_context(),
        }))

        msg = EmailMessage(strings.SIGN_UP_SUBJECT, message, to=(user.email,))
        msg.content_subtype = 'html'

        if settings.EMAIL_SWITCH['VERIFICATION_EMAIL']:
            msg.send()
            _logger.info("verification email sent to user : %s", user.email)
        else:
            _logger.info("verification email disabled. skipping email for user : %s", user.email)
            _logger.debug("DUMPING VERIFICATION EMAIL : %s", message)

        return user



