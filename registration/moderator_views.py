import logging

from django.http import HttpResponse
from django.forms import Form
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib import messages
from .models import GROUP_NAME_MODERATOR

_logger = logging.getLogger(__name__)

class Login(View):
    def post(self, request):
        print(request.POST)
        form = AuthenticationForm(data=request.POST)
        _logger.info("moderator login attempt")
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                if user.groups.filter(name=GROUP_NAME_MODERATOR).exists():
                    login(request, user)
                    _logger.info("moderator successfully logged in : %s",user)
                    return HttpResponse(status=204)
        _logger.warn("moderator login failed form : %s", request.POST)
        return HttpResponse('{"message":"login failed"}',status=400)


class Logout(View):
    def post(self, request):
            logout(request)
            _logger.info("moderator successfully logged out")
            return HttpResponse(status=204)
