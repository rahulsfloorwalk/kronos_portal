from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'audit_store/latest$', views.AuditStoreLatest.as_view(), name='audit_store_latest'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AttachmentByAuditStore.as_view(), name='attachment_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerByAuditStore.as_view(), name='answer_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionByAuditStore.as_view(), name='section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'store/(?P<store_id>[0-9]+)/audit_store$', views.AuditStoreByStore.as_view(), name='audit_store_by_store'),
    url(r'store/(?P<store_id>[0-9]+)$', views.StoreById.as_view(), name='store_by_id'),
    url(r'store$', views.StoreByClient.as_view(), name='store_by_client'),
], 'client_rest')

