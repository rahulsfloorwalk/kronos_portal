import logging

from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages

from registration.forms import GroupAuthenticationForm
from .models import GROUP_NAME_MANAGER

_logger = logging.getLogger(__name__)

class Login(View):
    __template = 'registration/manager/login.html'
    __manager_url = settings.FRONTEND_CONFIG["MANAGER"]["LOGIN_SUCCESS_REDIRECT_URL"]

    def get(self, request):
        _logger.info("manager login page requested")
        if request.user.is_authenticated() and request.user.groups.filter(name=GROUP_NAME_MANAGER).exists():
            _logger.info("auto redirecting manager logged in: %s", request.user)
            return redirect(self.__manager_url)
        else:
            form = GroupAuthenticationForm(GROUP_NAME_MANAGER)
            _logger.info("manager login page served")
            return render(request, self.__template, {'form': form})

    def post(self, request):
        form = GroupAuthenticationForm(GROUP_NAME_MANAGER, data=request.POST)
        _logger.info("manager login attempt with username: >%s<", request.POST.get('username','<blank>'))
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            _logger.info("manager logged in : %s",user)
            return redirect(self.__manager_url)
        _logger.info("login failed with invalid form")
        return render(request, self.__template, {'form': form})


class Logout(View):

    @method_decorator(login_required)
    def post(self, request):
        _logger.info("logging out: %s", request.user)
        logout(request)
        messages.add_message(request, messages.SUCCESS, 'Logged out successfully.')
        return redirect('registration:manager_login')

