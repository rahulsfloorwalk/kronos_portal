from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, PasswordResetForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from auditor.models import ProfileInfo
from django.contrib.auth.models import User
from .forms import SignUpForm
import datetime

class Login(View):
    __template = 'registration/login.html'

    def get(self, request):
        form = AuthenticationForm()
        return render(request, self.__template, {'form': form})

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                login(request, user)
                return redirect('auditor:dashboard')
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
