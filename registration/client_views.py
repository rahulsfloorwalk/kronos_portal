import logging

from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages
from .models import GROUP_NAME_CLIENT

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/client/login.html'
    __client_url = '/static/client/client.html'

    def get(self, request):
        if not request.user.is_authenticated():
            form = AuthenticationForm()
            return render(request, self.__template, {'form': form})
        elif request.user.groups.filter(name=GROUP_NAME_CLIENT).exists():
            login(request, request.user)
            _logger.info("client auto redirected: %s", request.user)
            return redirect(self.__client_url)

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        _logger.info("client login attempt")
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                if user.groups.filter(name=GROUP_NAME_CLIENT).exists():
                    login(request, user)
                    _logger.info("client_user successfully logged in : %s",user)
                    return redirect(self.__client_url)
                else:
                    _logger.warn("client_user login failed : %s",user)
                    messages.add_message(request, messages.WARNING, 'Login Failed')
        _logger.warn("client_user login failed form : %s", request.POST)
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
            _logger.info("client_user successfully logged out")
            return redirect('registration:client_login')
        else:
            _logger.warn("client_user logout failed")
            return render(request, self.__template, {'form': form})
