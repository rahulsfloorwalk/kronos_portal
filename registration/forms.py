from django import forms
from django.contrib.auth.models import User,Group
from django.core.validators import validate_email
from registration.models import Verification
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from auditor.models import ProfileInfo
from django.core.mail import send_mail
import hashlib, datetime
import properties
from os import urandom

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
        auth_data['activation_key'] = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()
        
        auth_data['expiry'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
        auth_data['email_path'] = "registration/password_reset_email.html"
        auth_data['email_subject'] = "registration/password_reset_subject.txt"

        verification = Verification()
        verification.user = user
        verification.activation_key = auth_data['activation_key']
        verification.key_expires = auth_data['expiry']
        verification.save()

        self.sendEmail(auth_data, profile_info)
        return user

    def sendEmail(self, auth_data, profileinfo):
        link = properties.ACTIVATION_LINK_ADDRESS + auth_data['activation_key']

        subject = strings.SIGN_UP_SUBJECT
        content = strings.VERIFICATION_EMAIL.format(link)

        send_mail(subject, content, properties.ACTIVATION_LINK_SENDER, [auth_data['email']], fail_silently=False)


