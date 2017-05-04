from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)/store$', views.AuditCycleCityStoreAverageReport.as_view(), name='audit_cycle_city_store_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)$', views.AuditCycleStoreSectionAverageReport.as_view(), name='audit_cycle_store_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)/audit_store$', views.AuditCycleAuditStoreSectionReport.as_view(), name='audit_cycle_audit_store_section'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)$', views.AuditCycleCitySectionAverageReport.as_view(), name='audit_cycle_city_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)$', views.AuditCycleCityAverageReport.as_view(), name='audit_cycle_city_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city$', views.AuditCycleCityPerformance.as_view(), name='audit_cycle_city_performance'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_cycle_xlsx_report$', views.AuditCycleXlsxReport.as_view(), name='audit_cycle_xlsx_report'),

    url(r'audit_store/latest$', views.AuditStoreLatest.as_view(), name='audit_store_latest'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AttachmentByAuditStore.as_view(), name='attachment_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerByAuditStore.as_view(), name='answer_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionByAuditStore.as_view(), name='section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/xlsx_report$', views.AuditStoreXlsxReport.as_view(), name='audit_store_xlsx_report'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'store/(?P<store_id>[0-9]+)/audit_store$', views.AuditStoreByStore.as_view(), name='audit_store_by_store'),
    url(r'store/(?P<store_id>[0-9]+)$', views.StoreById.as_view(), name='store_by_id'),
    url(r'store$', views.StoreByClient.as_view(), name='store_by_client'),
    url(r'user$', views.ClientUserView.as_view(), name='client_user_view'),
    url(r'audit_cycle$', views.AuditCycleView.as_view(), name='audit_cycle_view'),
    url(r'audit_cycle/aggregation$', views.AuditCycleAggregate.as_view(), name='audit_cycle_aggregation'),
    url(r'city$', views.CityView.as_view(), name='city_view'),
], 'client_rest')
