import logging

from django.conf import settings
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.views import View
from django.db.transaction import atomic
from django.contrib import messages
from django.urls import reverse

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_AGENCY
from registration.formss.AgencySignUpForm import AgencySignUpForm
from registration.forms import AgencyAuthenticationForm
from registration.service import verification_service

_logger = logging.getLogger(__name__)

class Login(View):
    __template = "registration/agency/login.html"
    __agency_url = settings.FRONTEND_CONFIG["AGENCY"]["LOGIN_SUCCESS_REDIRECT_URL"]
    def get(self, request):
        if request.user.is_authenticated() and request.user.groups.filter(name=GROUP_NAME_AGENCY).exists():
            _logger.debug("agency_user auto redirected: %s", request.user)
            return redirect(self.__agency_url)
        else:
            form = AgencyAuthenticationForm()
            return render(request, self.__template, {'form': form})

    def post(self, request):
        form = AgencyAuthenticationForm(data=request.POST)
        _logger.debug("agency_user login attempt")
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            _logger.debug("agency_user successfully logged in : %s",user)
            return redirect(self.__agency_url)
        _logger.warn("agency_user login failed : %s")
        messages.add_message(request, messages.WARNING, 'Login Failed')
        _logger.warn("agency_user login failed form : %s", request.POST)
        return render(request, self.__template, {'form': form})


class Logout(View):
    def post(self, request):
        logout(request)
        _logger.debug("agency_user successfully logged out")
        messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
        return redirect('registration:agency_login')


class SignUp(View):
    __template = 'registration/agency/signup.html'
    __agency_url = settings.FRONTEND_CONFIG["AGENCY"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        _logger.debug("agency signup form requested")
        form = AgencySignUpForm()
        return render(request, self.__template, {'form': form})

    @atomic
    def post(self, request):
        _logger.debug("agency signup form submitted with username: >%s<", request.POST.get('username','<blank>'))
        form = AgencySignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user is not None:
                _logger.debug("user %s signed up successfully", user)
                return redirect(reverse('registration:agency_signup_success'))
        _logger.debug("agency signup form invalid")
        return render(request, self.__template, {'form': form})

@atomic
def verify_email(request, key):
    try:
        verification = verification_service.verify_by_activation_key(key)
        login(request, verification.user, backend='registration.backends.CaseInsensitiveModelBackend')
    except ObjectNotFound as e:
        _logger.debug("verification failed for key: %s", key)
    return redirect('registration:agency_login')

def signup_success(request):
    return render(request, 'registration/signup_success.html')

