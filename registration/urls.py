from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'login', views.Login.as_view(), name="login"),
    url(r'logout', views.Logout.as_view(), name="logout"),
    url(r'signup$', views.SignUp.as_view(), name="signup"),
    url(r'signup/success$', views.signup_success, name="signup_success"),
], 'registration')
