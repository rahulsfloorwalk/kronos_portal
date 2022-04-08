import logging

from django.utils.http import is_safe_url
from django.conf import settings
from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages
from .models import GROUP_NAME_CLIENT
from django.db.transaction import atomic
from django.urls import reverse
from registration.formss.ClientSignUpForm import ClientSignUpForm
from registration.forms import GroupAuthenticationForm
from registration.service import verification_service

from kronos.exceptions import ObjectNotFound

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/client/login.html'
    __client_url = settings.FRONTEND_CONFIG["CLIENT"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        next_url = request.GET.get('next')
        if request.user.is_authenticated() and request.user.groups.filter(name=GROUP_NAME_CLIENT).exists():
            _logger.info("client auto redirected: %s", request.user)
            if next_url and is_safe_url(next_url, request.get_host()):
                return redirect(next_url)
            else:
                return redirect(self.__client_url)
        else:
            form = GroupAuthenticationForm(GROUP_NAME_CLIENT)
            return render(request, self.__template, {'form': form, 'next': next_url})

    def post(self, request):
        next_url = request.POST.get('next')
        form = GroupAuthenticationForm(GROUP_NAME_CLIENT, data=request.POST)
        _logger.info("client login attempt")
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            if next_url and is_safe_url(next_url, request.get_host()):
                _logger.info("client_user successfully logged in : %s and redirected to: %s", user, next_url)
                return redirect(next_url)
            else:
                _logger.info("client_user successfully logged in : %s",user)
                return redirect(self.__client_url)
        else:
            _logger.warn("client_user login failed : %s")
            messages.add_message(request, messages.WARNING, 'Login Failed')
        _logger.warn("client_user login failed form : %s", request.POST)
        return render(request, self.__template, {'form': form})


class LogoutForm(Form):
    pass

class Logout(View):

    @method_decorator(login_required)
    def post(self, request):
        _logger.info("logging out client_user: %s", request.user)
        logout(request)
        messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
        _logger.info("client_user successfully logged out")
        return redirect('registration:client_login')


class SignUp(View):
    __template = 'registration/client/signup.html'

    def get(self, request):
        _logger.debug("client signup form requested")
        form = ClientSignUpForm()
        return render(request, self.__template, {'form': form})

    @atomic
    def post(self, request):
        _logger.debug("client signup form submitted with username: >%s<", request.POST.get('username','<blank>'))
        form = ClientSignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user is not None:
                _logger.debug("user %s signed up successfully", user)
                return redirect(reverse('registration:client_signup_success'))
        _logger.debug("client signup form invalid")
        return render(request, self.__template, {'form': form})

@atomic
def verify_email(request, key):
    try:
        verification = verification_service.verify_by_activation_key(key)
        login(request, verification.user, backend='registration.backends.CaseInsensitiveModelBackend')
    except ObjectNotFound as e:
        _logger.debug("verification failed for key: %s", key)
    return redirect('registration:client_login')

def signup_success(request):
    return render(request, 'registration/signup_success.html')