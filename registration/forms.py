from django import forms
from django.urls import reverse
from django.contrib.auth.models import User,Group
from django.core.validators import validate_email
from registration.models import Verification
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from auditor.models import ProfileInfo
from django.core.mail import send_mail
from django.utils import timezone
import hashlib, datetime
import properties
from os import urandom
from django.template import Context
from django.template.loader import render_to_string, get_template
from django.core.mail import EmailMessage

import strings
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

class SignUpForm(UserCreationForm):
    phone = forms.CharField(max_length=10, required = True)

    class Meta:
        model = User
        fields = ("username", "phone", "password1", "password2")

    def is_valid(self):
        valid = super(SignUpForm, self).is_valid() 
        if User.objects.filter(email=self.data["username"]).exists():
            self.add_error("username", "a user with email {} already exists".format(self.data["username"]))
            valid = False

        try:
            validate_email(self.data["username"])
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
            'protocol': 'http',
            'key': activation_key,
            'email': user.email,
            'mydomain': properties.MY_DOMAIN
        }))

        msg = EmailMessage( strings.SIGN_UP_SUBJECT, message, to=(user.email,))
        msg.content_subtype = 'html'
        msg.send()

        return user



