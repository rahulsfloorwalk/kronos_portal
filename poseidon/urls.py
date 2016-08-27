from django.conf.urls import url
from . import views

urlpatterns = [
# urls must be of form /<user_id>/dashboard
    url(r'dashboard', views.index, name="index"),
    url(r'details', views.details, name="details"),
    url(r'profile', views.profile, name="profile"),
    url(r'submit', views.submit, name="submit"),
]
