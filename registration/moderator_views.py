import logging

from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.views import View
from .models import GROUP_NAME_MODERATOR

from registration.forms import GroupAuthenticationForm

_logger = logging.getLogger(__name__)

class Login(View):
    def post(self, request):
        print(request.POST)
        form = GroupAuthenticationForm(GROUP_NAME_MODERATOR, data=request.POST)
        _logger.info("moderator login attempt")
        if form.is_valid():
            user = form.get_user()
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
