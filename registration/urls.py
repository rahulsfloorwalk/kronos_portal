from django.conf.urls import url
from django.contrib.auth.views import password_reset, password_reset_done, password_reset_confirm, password_reset_complete
from django.contrib.auth.views import password_change, password_change_done

import properties
from . import views

urlpatterns = ([
    url(r'login', views.Login.as_view(), name="login"),
    url(r'logout', views.Logout.as_view(), name="logout"),
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
        'extra_email_context': {
            'mydomain': properties.MY_DOMAIN
        }
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
], 'registration')
