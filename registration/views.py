from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from auditor.models import ProfileInfo
from django.contrib.auth.models import User
from .forms import SignUpForm

class Login(View):
    __template = 'registration/login.html'

    def get(self, request):
        form = AuthenticationForm()
        return render(request, self.__template, {'form': form})

    def post(self, request):
        print(request.POST)
        form = AuthenticationForm(data=request.POST)
        print(form.is_valid())
        if form.is_valid():
            user = form.get_user()
            print(user)
            if user is not None:
                login(request, user)
                print("hello")
                return redirect('auditor:dashboard')
        print("haffailed")
        print(form.errors)
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
            print(user.id)
            profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
            profile_info.save()
            if user is not None:
                return redirect('registration:signup_success')
        else:
            return render(request, self.__template, {'form': form})

def signup_success(request):
    return render(request, 'registration/signup_success.html')

class ForgotPassword(View):
    __template = 'registration/forgot_password.html'
    def get(self, request): 
        return render(request, self.__template)
    def post(self, request):
        return redirect('registration:forgot_password_success')
def forgot_password_success(request):
    return render(request, 'registration/forgot_password_success.html')