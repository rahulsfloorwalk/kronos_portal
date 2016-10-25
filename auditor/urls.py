from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'dashboard', views.dashboard, name="dashboard"),

    url(r'profile-api$', views.ProfileInfoView.as_view(), name="profile_info_view"),
    url(r'additional-api$', views.AdditionalInfoView.as_view(), name="additional_info_view"),
    url(r'bank-api$', views.BankInfoView.as_view(), name="bank_info_view"),

    url(r'profile$', views.profile, name="profile"),
    url(r'profile/edit', views.ProfileInfoFormView.as_view(), name="profile_info_edit"),
    url(r'profile/additional/edit', views.AdditionalInfoFormView.as_view(), name="additional_info_edit"),
    url(r'profile/bank/edit', views.BankInfoFormView.as_view(), name="bank_info_edit"),

    url(r'audit$', views.AvailableAuditsView.as_view(), name="available_audits"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application/cancel$', views.AuditApplicationCancelView.as_view(), name="audit_application_cancel_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application/apply$', views.AuditApplicationApplyView.as_view(), name="audit_application_apply_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name="audit_application_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/applications$', views.AuditApplicationsView.as_view(), name="audit_applications_view"),
    url(r'audit/(?P<audit_id>[0-9]+)$', views.AuditView.as_view(), name="audit_view"),
], 'auditor')
