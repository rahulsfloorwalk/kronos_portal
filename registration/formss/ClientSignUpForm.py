from django import forms
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django.db.models import Q

from auditor.validators import numericValidator
from kronos.utils import validate_business_email
from registration.service import mobile_number_service
from registration.service import client


class ClientSignUpForm(UserCreationForm):
    mobile_number = forms.CharField(min_length=10, max_length=10, required = True, validators=[numericValidator])
    client_name = forms.CharField(max_length=50, required = True)
    full_name = forms.CharField(max_length=50, required = True)
    tos_accept = forms.BooleanField(required = True)

    class Meta:
        model = User
        fields = ("username", "password1", "password2")

    def clean_username(self):
        to_check_email = self.cleaned_data["username"]

        validate_email(to_check_email)

        if to_check_email:
            to_check_email = to_check_email.strip().lower()
            if not validate_business_email(to_check_email):
                raise ValidationError("A user with email %(email)s is not a business type email", params={"email": to_check_email})
        if User.objects.filter(Q(email__iexact=to_check_email) | Q(username__iexact=to_check_email)).exists():
            raise ValidationError("A user with email %(email)s already exists", params={"email": to_check_email})

        return to_check_email

    def clean_mobile_number(self):
        if mobile_number_service.mobile_number_exists(self.cleaned_data["mobile_number"]):
            raise ValidationError("A user with mobile number %(mobile_number)s already exists", params={"mobile_number": self.cleaned_data["mobile_number"]})

        return self.cleaned_data["mobile_number"]

    def save(self, commit=True):
        return client.client_signup(
            self.cleaned_data["username"],
            self.cleaned_data["password1"],
            self.cleaned_data["client_name"],
            self.cleaned_data["full_name"],
            self.cleaned_data["mobile_number"],
        )

