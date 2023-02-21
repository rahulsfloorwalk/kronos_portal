import logging

from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils.http import is_safe_url
from django.views import View
from django.contrib import messages
from django.db.transaction import atomic

from registration.service import auditor as auditor_service
from registration.models import GROUP_NAME_AUDITOR
from registration.forms import SignUpForm, AuditorAuthenticationForm

from kronos.exceptions import ObjectNotFound

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/login.html'
    __auditor_url = settings.FRONTEND_CONFIG["AUDITOR"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        next_url = request.GET.get('next')
        _logger.info("login page requested")
        if request.user.is_authenticated() and request.user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            _logger.info("auto redirecting auditor logged in: %s", request.user)
            if next_url and is_safe_url(next_url, request.get_host()):
                return redirect(next_url)
            else:
                return redirect(self.__auditor_url)
        else:
            form = AuditorAuthenticationForm()
            if next_url and is_safe_url(next_url, request.get_host()):
                messages.add_message(request, messages.WARNING, 'You need to login to access this page.')
            _logger.info("login page served")
            return render(request, self.__template, {'form': form, 'next': next_url})

    def post(self, request):
        next_url = request.POST.get('next')
        form = AuditorAuthenticationForm(data=request.POST)
        _logger.info("login attempt with username: >%s<", request.POST.get('username','<blank>'))
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            if next_url and is_safe_url(next_url, request.get_host()):
                _logger.info("auditor logged in : %s and redirected to: %s",user, next_url)
                return redirect(next_url)
            else:
                _logger.info("auditor logged in : %s",user)
                return redirect(self.__auditor_url)
        _logger.info("login failed with invalid form")
        return render(request, self.__template, {'form': form, 'next': next_url})


class Logout(View):

    @method_decorator(login_required)
    def post(self, request):
        _logger.info("logging out: %s", request.user)
        logout(request)
        messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
        return redirect('registration:login')

class SignUp(View):
    __template = 'registration/signup.html'

    def get(self, request):
        _logger.info("signup form requested")
        form = SignUpForm()
        return render(request, self.__template, {'form': form})

    @atomic
    def post(self, request):
        _logger.info("signup form submitted with username: >%s<", request.POST.get('username','<blank>'))
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user is not None:
                _logger.info("user %s signed up successfully", user)
                return redirect('registration:signup_success')
        _logger.info("signup form invalid")
        return render(request, self.__template, {'form': form})

def signup_success(request):
    return render(request, 'registration/signup_success.html')


@atomic
def activate(request, key):
    try:
        user = auditor_service.verify_auditor_by_key(key)
        login(request, user, backend='registration.backends.CaseInsensitiveModelBackend')
    except ObjectNotFound as e:
        _logger.info("verification failed for key: %s", key)
    return redirect('registration:login')
