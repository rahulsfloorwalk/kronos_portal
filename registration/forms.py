from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required = True)
    phone = forms.CharField(required = True)

    class Meta:
        model = User
        fields = ("username", "email", "phone", "password1", "password2")

    def save(self, commit = True):
        user = super(ProfileCreationForm, self).save(commit = False)
        user.email = self.cleaned_data["email"]
        user.phone = self.cleaned_data["phone"]
        if commit:
            user.save()
        return user
