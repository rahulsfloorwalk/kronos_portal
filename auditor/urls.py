from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),

    url(r'profile-api$', views.ProfileInfoView.as_view(), name="profile_info_view"),
    url(r'additional-api$', views.AdditionalInfoView.as_view(), name="additional_info_view"),
    url(r'bank-api$', views.BankInfoView.as_view(), name="bank_info_view"),

    url(r'audit$', views.AvailableAuditsView.as_view(), name="available_audits"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application/cancel$', views.AuditApplicationCancelView.as_view(), name="audit_application_cancel_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application/apply$', views.AuditApplicationApplyView.as_view(), name="audit_application_apply_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/location/(?P<location_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name="audit_application_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/applications$', views.AuditApplicationsView.as_view(), name="audit_applications_view"),
    url(r'audit/(?P<audit_id>[0-9]+)$', views.AuditView.as_view(), name="audit_view"),
], 'auditor')
