from django.conf.urls import url
from . import views

urlpatterns = ([
# urls must be of form /<user_id>/dashboard
    url(r'dashboard', views.dashboard, name="dashboard"),
], 'auditor')
