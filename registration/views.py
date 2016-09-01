from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from auditor.models import ProfileInfo
from django.contrib.auth.models import User
from .forms import ProfileCreationForm

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
        form = ProfileCreationForm()
        return render(request, self.__template, {'form': form})
    def post(self, request):
        form = ProfileCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            print(user.id)
            profileInfo = ProfileInfo(user_id=user.id, mobile_number=user.phone)
            profileInfo.save()
            if user is not None:
                return redirect('registration:signup_success')
        else:
            return render(request, self.__template, {'form': form})

def signup_success(request):
    return render(request, 'registration/signup_success.html')


