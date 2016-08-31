from django.conf.urls import url
from . import views

urlpatterns = ([
# urls must be of form /<user_id>/dashboard
    url(r'dashboard', views.dashboard, name="dashboard"),
    url(r'profile$', views.profile, name="profile"),
    url(r'profile/edit', views.profile_edit, name="profile_edit"),
    url(r'profile/additional/edit', views.profile_additional_edit, name="profile_additional_edit"),
    url(r'profile/bank/edit', views.profile_bank_edit, name="profile_bank_edit"),
], 'auditor')
