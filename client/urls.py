from django.conf.urls import url
from .import views

urlpatterns = ([
    url(r'client', views.ClientView.as_view(), name='client_view'),
    url(r'location', views.LocationView.as_view(), name='location_view'),
    url(r'audit', views.AuditView.as_view(), name='audit_view'),
    url(r'audit-location', views.AuditLocationView.as_view(), name='audit_location_view'),
], 'client')
