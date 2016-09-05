from django import forms
from django.contrib.auth.models import User
from registration.models import Verification
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required = True)
    phone = forms.CharField(required = True)

    class Meta:
        model = User
        fields = ("username", "email", "phone", "password1", "password2")

    def save(self, auth_data, commit = True):
        user = super(SignUpForm, self).save(commit = False)
        user.email = self.cleaned_data["email"]
        user.phone = self.cleaned_data["phone"]
        if commit:
            user.save()
            verification = Verification()
            verification.user = user
            verification.activation_key = auth_data['activation_key']
            verification.key_expires = auth_data['expiry']
            verification.save()
        return user

    def sendEmail(self, auth_data):
        print(auth_data['activation_key'])
        print(auth_data['expiry'])