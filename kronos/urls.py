"""kronos URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.conf.urls import include, url
from django.conf import settings
from django.contrib import admin
import registration.urls as registration_urls
import auditor.urls as auditor_urls
import manager.urls as manager_urls
import client_rest.urls as client_urls
import moderator_rest.urls as moderator_urls

urlpatterns = [
    url(r'^$', lambda r: HttpResponseRedirect(reverse('registration:login'))),
    url(r'^admin/', admin.site.urls),
    url(r'^auth/', include(registration_urls.urlpatterns)),
    url(r'^auditor/', include(auditor_urls.urlpatterns)),
    url(r'^manager/', include(manager_urls.urlpatterns)),
    url(r'^client/', include(client_urls.urlpatterns)),
    url(r'^moderator/', include(moderator_urls.urlpatterns)),
]

if settings.DEBUG and settings.DEBUG_TOOLBAR:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
