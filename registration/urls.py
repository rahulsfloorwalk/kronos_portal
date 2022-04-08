from django.conf.urls import url
from django.contrib.auth.views import password_reset, password_reset_done, password_reset_confirm, password_reset_complete
from django.contrib.auth.views import password_change, password_change_done

from . import views
from . import views_api
from . import client_views
from . import moderator_views
from . import manager_views
from . import agency_views
from .context import registration_context

urlpatterns = ([
    # Agency Portal Login Logout Views
    url(r'agency/login$', agency_views.Login.as_view(), name="agency_login"),
    url(r'agency/logout$', agency_views.Logout.as_view(), name="agency_logout"),
    url(r'agency/signup$', agency_views.SignUp.as_view(), name="agency_signup"),
    url(r'agency/verify_email/(?P<key>.+)$', agency_views.verify_email, name="agency_verify_email"),
    url(r'agency/signup/success$', agency_views.signup_success, name="agency_signup_success"),

    # Moderator Portal Login Logout Views
    url(r'moderator/login$', moderator_views.Login.as_view(), name="moderator_login"),
    url(r'moderator/logout$', moderator_views.Logout.as_view(), name="moderator_logout"),

    # Manager Portal Login Logout Views
    url(r'manager/login$', manager_views.Login.as_view(), name="manager_login"),
    url(r'manager/logout$', manager_views.Logout.as_view(), name="manager_logout"),

    # Client Portal Login Logout Views
    url(r'client/login$', client_views.Login.as_view(), name="client_login"),
    url(r'client/logout$', client_views.Logout.as_view(), name="client_logout"),
    url(r'client/verify_email/(?P<key>.+)$', client_views.verify_email, name="client_verify_email"),
    url(r'client/signup/success$', client_views.signup_success, name="client_signup_success"),
    url(r'client/signup$', client_views.SignUp.as_view(), name="client_signup"),

    url(r'login$', views.Login.as_view(), name="login"),
    url(r'logout$', views.Logout.as_view(), name="logout"),
    url(r'signup$', views.SignUp.as_view(), name="signup"),
    url(r'signup/success$', views.signup_success, name="signup_success"),

    url(r'password_change$', password_change, {
        'template_name': 'registration/password_change.html',
        'post_change_redirect': 'registration:password_change_done',
    }, name="password_change"),

    url(r'password_change_done$', password_change_done, {
        'template_name': 'registration/password_change_done2.html',
    }, name="password_change_done"),

    url(r'forgot_password$', password_reset, {
        'template_name': 'registration/forgot_password.html',
        'subject_template_name': 'registration/password_reset_subject2.txt',
        'email_template_name': 'registration/password_reset_email2.txt',
        'html_email_template_name': 'registration/password_reset_email2.html',
        'post_reset_redirect': 'registration:password_reset_done',
        'extra_email_context': registration_context(),
    }, name="password_reset"),

    url(r'forgot_password/success$', password_reset_done, {
        'template_name': 'registration/forgot_password_success.html'
    }, name="password_reset_done"),

    url(r'forgot_password/reset/(?P<uidb64>.+)/(?P<token>.+)$', password_reset_confirm, {
        'template_name': 'registration/password_reset_confirm2.html',
        'post_reset_redirect': 'registration:password_reset_complete'
    }, name="password_reset_confirm"),

    url(r'forgot_password/complete$', password_reset_complete, {
        'template_name': 'registration/password_reset_complete2.html',
    },name="password_reset_complete"),

    url(r'activate/(?P<key>.+)$', views.activate, name="activate"),

    # API for android app
    url(r'api/signup_api$', views_api.SignUpAPI.as_view(), name="signup_api"),
    url(r'api/login_api$', views_api.LoginAPI.as_view(), name="login_api"),

], 'registration')
