import logging

from django.forms import Form
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, PasswordResetForm, SetPasswordForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.transaction import atomic
from auditor.models import ProfileInfo
from .models import Verification, GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from .forms import SignUpForm
import datetime

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/login.html'
    __auditor_url = '/static/auditor.html'
    __manager_url = '/static/manager.html'

    def get(self, request):
        _logger.info("login page requested")
        if not request.user.is_authenticated():
            form = AuthenticationForm()
            _logger.info("login page served")
            return render(request, self.__template, {'form': form})
        elif request.user.groups.filter(name=GROUP_NAME_MANAGER).exists():
            login(request, request.user)
            _logger.info("auto redirecting manager logged in: %s", request.user)
            return redirect(self.__manager_url)
        elif request.user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            login(request, request.user)
            _logger.info("auto redirecting auditor logged in: %s", request.user)
            return redirect(self.__auditor_url)
        else:
            ## user IS logged in, but is not an auditor or manager
            ## let the client login view handle this shit
            return redirect('registration:client_login')

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        _logger.info("login attempt with username: %s", request.POST.get('username','<blank>'))
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
        return render(request, self.__template, {'form': form})


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
        _logger.info("signup form submitted with username: %s", request.POST.get('username','<blank>'))
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
    verification = get_object_or_404(Verification, activation_key=key)
    if verification is not None:
        _logger.info("found verification for key: %s", key)
        if verification.is_verified is False:
            verification.is_verified = True
            verification.save()
            user = verification.user
            user.is_active = True
            user.save()
            _logger.info("verified user %s successfully", user)
            messages.add_message(request, messages.SUCCESS, 'Your email has been verified. Please login to continue.')
        else:
            _logger.info("verification is already done for key: %s", key)
    else:
        _logger.info("verification not found for key: %s", key)
    return redirect('registration:login')
