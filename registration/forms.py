from django import forms
from django.contrib.auth.models import User,Group
from registration.models import Verification
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from auditor.models import ProfileInfo
from django.core.mail import send_mail
import hashlib, datetime
import properties
from os import urandom

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required = True)
    phone = forms.CharField(max_length=10, required = True)

    class Meta:
        model = User
        fields = ("username", "email", "phone", "password1", "password2")

    def is_valid(self):
        valid = super(SignUpForm, self).is_valid() 
        if User.objects.filter(email=self.cleaned_data["email"]).exists():
            self.add_error("email", "a user with email {} already exists".format(self.cleaned_data["email"]))
            valid = False
        return valid

    def save(self, commit = True):
        user = super(SignUpForm, self).save(commit = False)
        user.email = self.cleaned_data["email"]
        user.phone = self.cleaned_data["phone"]
        user.save()
        user.groups.add(Group.objects.get(name="Auditor"))
        user.save()

        profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
        profile_info.save()

        auth_data = {}
        auth_data['username'] = self.cleaned_data['username']
        auth_data['email'] = self.cleaned_data['email']
        
        salt_hash_hexstr = hashlib.sha1(urandom(16)).hexdigest()
        username_hash_hexstr = hashlib.sha1(auth_data["username"].encode('utf-8')).hexdigest()
        cat_str = salt_hash_hexstr + username_hash_hexstr
        auth_data['activation_key'] = hashlib.sha1(cat_str.encode('utf-8')).hexdigest()
        
        auth_data['expiry'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
        auth_data['email_path'] = "registration/password_reset_email.html"
        auth_data['email_subject'] = "registration/password_reset_subject.txt"

        verification = Verification()
        verification.user = user
        verification.activation_key = auth_data['activation_key']
        verification.key_expires = auth_data['expiry']
        verification.save()

        self.sendEmail(auth_data)
        return user

    def sendEmail(self, auth_data):
        link = properties.ACTIVATION_LINK_ADDRESS + auth_data['activation_key']
        send_mail('Account activation link', link, properties.ACTIVATION_LINK_SENDER, [auth_data['email']], fail_silently=False)

#class LoginForm(AuthenticationForm):

