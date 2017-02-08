from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages
from .models import GROUP_NAME_CLIENT

class Login(View):
    __template = 'registration/client/login.html'
    __client_url = '/static/client/client.html'

    def get(self, request):
        if not request.user.is_authenticated():
            form = AuthenticationForm()
            return render(request, self.__template, {'form': form})
        elif request.user.groups.filter(name=GROUP_NAME_CLIENT).exists():
            login(request, request.user)
            print("client auto redirected:", request.user)
            return redirect(self.__client_url)

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                if user.groups.filter(name=GROUP_NAME_CLIENT).exists():
                    login(request, user)
                    print("client logged in",user)
                    return redirect(self.__client_url)
                else:
                    messages.add_message(request, messages.WARNING, 'Login Failed')
        return render(request, self.__template, {'form': form})


class LogoutForm(Form):
    pass

class Logout(View):
    __template = 'registration/client/logout.html'

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
            return redirect('registration:client_login')
        else:
            return render(request, self.__template, {'form': form})
