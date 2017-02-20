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
        if not request.user.is_authenticated():
            form = AuthenticationForm()
            return render(request, self.__template, {'form': form})
        elif request.user.groups.filter(name=GROUP_NAME_MANAGER).exists():
            login(request, request.user)
            _logger.info("auto redirecting manager logged in: %s", request.user)
            return redirect(self.__manager_url)
        elif request.user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            login(request, request.user)
            _logger.info("auto redirecting auditor logged in: %s", request.user)
            return redirect(self.__auditor_url)

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        _logger.info("login attempt")
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
        return render(request, self.__template, {'form': form})


class LogoutForm(Form):
    pass

class Logout(View):
    __template = 'registration/logout.html'

    @method_decorator(login_required)
    def get(self, request):
        form = LogoutForm()
        return render(request, self.__template, {'form': form})

    @method_decorator(login_required)
    def post(self, request):
        form = LogoutForm(request.POST)
        if form.is_valid():
            logout(request)
            messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
            return redirect('registration:login')
        else:
            return render(request, self.__template, {'form': form})

class SignUp(View):
    __template = 'registration/signup.html'

    def get(self, request):
        form = SignUpForm()
        return render(request, self.__template, {'form': form})

    @atomic
    def post(self, request):
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user is not None:
                return redirect('registration:signup_success')
        return render(request, self.__template, {'form': form})

def signup_success(request):
    return render(request, 'registration/signup_success.html')

@atomic
def activate(request, key):
    verification = get_object_or_404(Verification, activation_key=key)
    if verification is not None:
        if verification.is_verified is False:
            verification.is_verified = True
            verification.save()
            user = verification.user
            user.is_active = True
            user.save()
            messages.add_message(request, messages.SUCCESS, 'Your email has been verified. Please login to continue.')
    return redirect('registration:login')
