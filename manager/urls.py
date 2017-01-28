from django.conf.urls import url
from . import views
from .viewss import auditor as auditor_views
from .viewss import client as client_views
from .viewss import store as store_views
from .viewss import audit as audit_views
from .viewss import audit_store as audit_store_views
from .viewss import audit_cycle as audit_cycle_views
from .viewss import section as section_views

urlpatterns = ([
    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),

    url(r'client/(?P<client_id>[0-9]+)/audit_cycle$', audit_cycle_views.AuditCycleViewByClient.as_view(), name='audit_cycle_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store$', store_views.StoreViewByClient.as_view(), name='store_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),

    url(r'audit/(?P<audit_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAudit.as_view(), name='audit_store_by_audit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$$', audit_store_views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_store$', audit_store_views.AuditStoreView.as_view(), name='audit_store_view'),

    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),

    url(r'application/(?P<application_id>[0-9]+)/assign$', views.AuditApplicationAssignView.as_view(), name='audit_application_assign_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),
    url(r'application/(?P<application_id>[0-9]+)/complete$', views.AuditApplicationCompleteView.as_view(), name='audit_application_complete_view'),
    url(r'application/(?P<application_id>[0-9]+)/fail$', views.AuditApplicationFailView.as_view(), name='audit_application_fail_view'),

    url(r'application/(?P<application_id>[0-9]+)$', views.AuditApplicationIdView.as_view(), name='audit_application_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation$', views.AuditLocationView.as_view(), name='audit_location_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation/(?P<auditlocation_id>[0-9]+)$', views.AuditLocationIdView.as_view(), name='audit_location_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name='audit_application_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),
    url(r'audit/(?P<audit_id>[0-9]+)$$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', audit_views.AuditView.as_view(), name='audit_view'),

    url(r'location/(?P<location_id>[0-9]+)$', views.LocationIdView.as_view(), name='location_id_view'),
    url(r'location$', views.LocationView.as_view(), name='location_view'),

    url(r'auditor/(?P<auditor_id>[0-9]+)/profile_info$', auditor_views.AuditorProfileInfoView.as_view(), name='auditor_profile_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/bank_info$', auditor_views.AuditorBankInfoView.as_view(), name='auditor_bank_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/additional_info$', auditor_views.AuditorAdditionalInfoView.as_view(), name='auditor_additional_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)$', auditor_views.AuditorIdView.as_view(), name='auditor_id_view'),
    url(r'auditor$', auditor_views.AuditorView.as_view(), name='auditor_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/section$', section_views.SectionViewByAuditCycle.as_view(), name='section_by_client'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', audit_cycle_views.AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', audit_cycle_views.AuditCycleView.as_view(), name='audit_cycle_view'),

    url(r'section/(?P<section_id>[0-9]+)$', section_views.SectionIdView.as_view(), name='section_id_view'),
    url(r'section$', section_views.SectionView.as_view(), name='section_view'),

], 'client')
