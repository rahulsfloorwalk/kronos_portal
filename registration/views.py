from django.forms import Form
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, PasswordResetForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.models import User
from django.contrib import messages
from auditor.models import ProfileInfo
from .models import Verification
from .forms import SignUpForm
import datetime

class Login(View):
    __template = 'registration/login.html'
    __auditor_url = '/static/auditor.html'
    __manager_url = '/static/manager.html'

    def get(self, request):
        form = AuthenticationForm()
        return render(request, self.__template, {'form': form})

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                try:
                    verification = Verification.objects.get(user_id=user.id)
                    if verification is not None and verification.is_verified is True:
                        login(request, user)
                        if user.groups.filter(name="Auditor").exists():
                            print("auditor",user)
                            return redirect(self.__auditor_url)
                        if user.groups.filter(name="Manager").exists():
                            print("manager",user)
                            return redirect(self.__manager_url)
                        messages.add_message(request, messages.WARNING, 'Your account is not in a group. Please contact site administrator.')
                    else:
                        messages.add_message(request, messages.WARNING, 'Your account is not verified. Please check your email for the verification link.')
                except Verification.DoesNotExist:
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
    def post(self, request):
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user is not None:
                return redirect('registration:signup_success')
        return render(request, self.__template, {'form': form})

def signup_success(request):
    return render(request, 'registration/signup_success.html')

class ForgotPassword(View):
    __template = 'registration/forgot_password.html'
    def get(self, request): 
        form = PasswordResetForm()
        return render(request, self.__template, { 'form': form})
    def post(self, request):
        form = PasswordResetForm(request.POST)
        print(request.POST)
        if form.is_valid():
            form.save(
                domain_override="vitric.in",
                from_email="support@vitric.in"
                )
            return redirect('registration:forgot_password_success')
        else:
            return render(request, self.__template, { 'form': form})

def forgot_password_success(request):
    return render(request, 'registration/forgot_password_success.html')

def activate(request, key):
    verification = get_object_or_404(Verification, activation_key=key)
    if verification is not None:
        if verification.is_verified is False:
            verification.is_verified = True
            verification.save()
            user = verification.user
            login(request, user)
            messages.add_message(request, messages.SUCCESS, 'Your email has been verified. Please login to continue.')
            redirect('auditor:dashboard')
    return redirect('registration:login')
