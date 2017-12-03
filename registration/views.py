import logging

from django.conf import settings
from django.forms import Form
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, PasswordResetForm, SetPasswordForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils.http import is_safe_url
from django.views import View
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.transaction import atomic
from auditor.models import ProfileInfo
from registration.service import auditor as auditor_service
from .models import Verification, GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from .forms import SignUpForm
import datetime
from kronos.exceptions import ObjectNotFound

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/login.html'
    __auditor_url = settings.FRONTEND_CONFIG["AUDITOR"]["LOGIN_SUCCESS_REDIRECT_URL"]
    __manager_url = settings.FRONTEND_CONFIG["MANAGER"]["LOGIN_SUCCESS_REDIRECT_URL"]
    __moderator_url = settings.FRONTEND_CONFIG["MODERATOR"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        next_url = request.GET.get('next')
        _logger.info("login page requested")
        if not request.user.is_authenticated():
            form = AuthenticationForm()
            if next_url and is_safe_url(next_url, request.get_host()):
                messages.add_message(request, messages.WARNING, 'You need to login to access this page.')
            _logger.info("login page served")
            return render(request, self.__template, {'form': form, 'next': next_url})
        elif request.user.groups.filter(name=GROUP_NAME_MANAGER).exists():
            _logger.info("auto redirecting manager logged in: %s", request.user)
            return redirect(self.__manager_url)
        elif request.user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            _logger.info("auto redirecting auditor logged in: %s", request.user)
            if next_url and is_safe_url(next_url, request.get_host()):
                return redirect(next_url)
            else:
                return redirect(self.__auditor_url)
        elif request.user.groups.filter(name=GROUP_NAME_MODERATOR).exists():
            _logger.info("auto redirecting moderator logged in: %s", request.user)
            return redirect(self.__moderator_url)
        else:
            ## user IS logged in, but is not an auditor or manager or moderator
            ## let the client login view handle this shit
            return redirect('registration:client_login')

    def post(self, request):
        next_url = request.POST.get('next')
        form = AuthenticationForm(data=request.POST)
        _logger.info("login attempt with username: >%s<", request.POST.get('username','<blank>'))
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                if user.groups.filter(name=GROUP_NAME_MANAGER).exists():
                    login(request, user)
                    _logger.info("manager logged in : %s",user)
                    return redirect(self.__manager_url)
                try:
                    verification = Verification.objects.get(user_id=user.id)
                    if verification is not None and verification.is_verified is True:
                        login(request, user)
                        if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
                            if next_url and is_safe_url(next_url, request.get_host()):
                                _logger.info("auditor logged in : %s and redirected to: %s",user, next_url)
                                return redirect(next_url)
                            else:
                                _logger.info("auditor logged in : %s",user)
                                return redirect(self.__auditor_url)
                        _logger.warn("user without group found : %s",user)
                        messages.add_message(request, messages.WARNING, 'Your account is not in a group. Please contact site administrator.')
                    else:
                        _logger.warn("please verify your account : %s",user)
                        messages.add_message(request, messages.WARNING, 'Your account is not verified. Please check your email for the verification link.')
                except Verification.DoesNotExist:
                    _logger.warn("User without verification found! : %s",user)
                    messages.add_message(request, messages.WARNING, 'Your account is in illegal state. Please contact site administrator.')
                    pass
        else:
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
