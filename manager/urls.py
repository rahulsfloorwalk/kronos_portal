from django.conf.urls import url
from .import views

urlpatterns = ([
    url(r'city$', views.CityView.as_view(), name='city_view'),
    url(r'client/(?P<client_id>[0-9]+)$', views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client$', views.ClientView.as_view(), name='client_view'),

    url(r'application/(?P<application_id>[0-9]+)/assign$', views.AuditApplicationAssignView.as_view(), name='audit_application_assign_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),
    url(r'application/(?P<application_id>[0-9]+)/complete$', views.AuditApplicationCompleteView.as_view(), name='audit_application_complete_view'),
    url(r'application/(?P<application_id>[0-9]+)/fail$', views.AuditApplicationFailView.as_view(), name='audit_application_fail_view'),

    url(r'application/(?P<application_id>[0-9]+)$', views.AuditApplicationIdView.as_view(), name='audit_application_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation$', views.AuditLocationView.as_view(), name='audit_location_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation/(?P<auditlocation_id>[0-9]+)$', views.AuditLocationIdView.as_view(), name='audit_location_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name='audit_application_view'),

    url(r'location/(?P<location_id>[0-9]+)$', views.LocationIdView.as_view(), name='location_id_view'),
    url(r'location$', views.LocationView.as_view(), name='location_view'),

    url(r'auditor/(?P<auditor_id>[0-9]+)/profile_info$', views.AuditorProfileInfoView.as_view(), name='auditor_profile_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/bank_info$', views.AuditorBankInfoView.as_view(), name='auditor_bank_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/additional_info$', views.AuditorAdditionalInfoView.as_view(), name='auditor_additional_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)$', views.AuditorIdView.as_view(), name='auditor_id_view'),
    url(r'auditor$', views.AuditorView.as_view(), name='auditor_view'),

    url(r'audit/(?P<audit_id>[0-9]+)$', views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', views.AuditView.as_view(), name='audit_view'),
], 'client')
