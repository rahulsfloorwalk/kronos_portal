import logging

from django.conf import settings
from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages
from .models import GROUP_NAME_CLIENT

from registration.forms import GroupAuthenticationForm

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/client/login.html'
    __client_url = settings.FRONTEND_CONFIG["CLIENT"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        if request.user.is_authenticated() and request.user.groups.filter(name=GROUP_NAME_CLIENT).exists():
            _logger.info("client auto redirected: %s", request.user)
            return redirect(self.__client_url)
        else:
            form = GroupAuthenticationForm(GROUP_NAME_CLIENT)
            return render(request, self.__template, {'form': form})

    def post(self, request):
        form = GroupAuthenticationForm(GROUP_NAME_CLIENT, data=request.POST)
        _logger.info("client login attempt")
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            _logger.info("client_user successfully logged in : %s",user)
            return redirect(self.__client_url)
        else:
            _logger.warn("client_user login failed : %s")
            messages.add_message(request, messages.WARNING, 'Login Failed')
        _logger.warn("client_user login failed form : %s", request.POST)
        return render(request, self.__template, {'form': form})


class LogoutForm(Form):
    pass

class Logout(View):

    @method_decorator(login_required)
    def post(self, request):
        _logger.info("logging out client_user: %s", request.user)
        logout(request)
        messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
        _logger.info("client_user successfully logged out")
        return redirect('registration:client_login')
