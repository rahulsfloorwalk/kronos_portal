from django.conf.urls import url
from . import views
from .viewss import auditor as auditor_views
from .viewss import client as client_views
from .viewss import store as store_views
from .viewss import audit as audit_views
from .viewss import audit_store as audit_store_views
from .viewss import audit_cycle as audit_cycle_views
from .viewss import section as section_views
from .viewss import question as question_views
from .viewss import answer as answer_views
from .viewss import client_user as client_user_views
from .viewss import report_section as report_section_views

urlpatterns = ([
    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),

    url(r'client/(?P<client_id>[0-9]+)/client_user$', client_user_views.ClientUserByClientView.as_view(), name='client_user_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/audit_cycle$', audit_cycle_views.AuditCycleViewByClient.as_view(), name='audit_cycle_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store$', store_views.StoreViewByClient.as_view(), name='store_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', audit_store_views.AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/withdraw$', audit_store_views.AuditStoreIdWithdrawView.as_view(), name='audit_store_id_withdraw_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', audit_store_views.AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/complete$', audit_store_views.AuditStoreIdCompleteView.as_view(), name='audit_store_id_complete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', answer_views.AnswerByAuditStore.as_view(), name='answers_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', report_section_views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/comment$', report_section_views.PMCommentSubmitView.as_view(), name='report_section_pm_comment_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', audit_store_views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle_view'),

    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),

    url(r'application/(?P<application_id>[0-9]+)/approve$', views.AuditApplicationApproveView.as_view(), name='audit_application_approve_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),
    url(r'application/(?P<application_id>[0-9]+)$', views.AuditApplicationIdView.as_view(), name='audit_application_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation$', views.AuditLocationView.as_view(), name='audit_location_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/auditlocation/(?P<auditlocation_id>[0-9]+)$', views.AuditLocationIdView.as_view(), name='audit_location_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name='audit_application_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),
    url(r'audit/(?P<audit_id>[0-9]+)$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
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

    url(r'section/(?P<section_id>[0-9]+)/question$', question_views.QuestionViewBySection.as_view(), name='question_view_by_section'),
    url(r'section/(?P<section_id>[0-9]+)$', section_views.SectionIdView.as_view(), name='section_id_view'),
    url(r'section$', section_views.SectionView.as_view(), name='section_view'),

    url(r'question/(?P<question_id>[0-9]+)$', question_views.QuestionIdView.as_view(), name='question_id_view'),
    url(r'question$', question_views.QuestionView.as_view(), name='question_view'),

    url(r'client_user/(?P<client_user_id>[0-9]+)$', client_user_views.ClientUserIdView.as_view(), name='client_user_id_view'),
    url(r'client_user$', client_user_views.ClientUserView.as_view(), name='client_user_view'),

], 'manager')
