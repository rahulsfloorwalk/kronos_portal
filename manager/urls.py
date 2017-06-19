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
from .viewss import attachment as attachment_views
from .viewss import notifications as notification_views
from .viewss import report_stats as report_stats_views
from .viewss import moderator as moderator_views

urlpatterns = ([
    url(r'notifications$', notification_views.NotificationsView.as_view(), name='notifications_view'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)$', report_stats_views.AuditCycleStoreSectionAverageReport.as_view(), name='audit_cycle_store_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)$', report_stats_views.AuditCycleCitySectionAverageReport.as_view(), name='audit_cycle_city_section_average'),

    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),

    url(r'client/(?P<client_id>[0-9]+)/client_user$', client_user_views.ClientUserByClientView.as_view(), name='client_user_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/audit_cycle$', audit_cycle_views.AuditCycleViewByClient.as_view(), name='audit_cycle_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store$', store_views.StoreViewByClient.as_view(), name='store_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client/(?P<client_id>[0-9]+)/audit_store/(?P<audit_store_id>[0-9]+)/xlsx_report$', audit_store_views.AuditStoreXlsxReport.as_view(), name='audit_store_xlsx_report'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', attachment_views.AuditStoreAttachmentView.as_view(), name='audit_store_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', audit_store_views.AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', audit_store_views.AuditStoreIdSubmitView.as_view(), name='audit_store_id_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/withdraw$', audit_store_views.AuditStoreIdWithdrawView.as_view(), name='audit_store_id_withdraw_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', audit_store_views.AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/complete$', audit_store_views.AuditStoreIdCompleteView.as_view(), name='audit_store_id_complete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/uncomplete$', audit_store_views.AuditStoreIdUnCompleteView.as_view(), name='audit_store_id_uncomplete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/pay$', audit_store_views.AuditStoreIdPayView.as_view(), name='audit_store_id_payment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unpay', audit_store_views.AuditStoreIdUnpayView.as_view(), name='audit_store_id_payment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', answer_views.AnswerByAuditStore.as_view(), name='answers_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/mark$', answer_views.MarkByQuestionAndStore.as_view(), name='mark_by_question_and_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_text$', answer_views.AnswerByQuestionAndStore.as_view(), name='answer_by_question_and_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/not_applicable$', answer_views.AnswerNotApplicableView.as_view(), name='answer_not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', report_section_views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', attachment_views.ReportSectionAttachmentView.as_view(), name='report_section_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/not_applicable$', report_section_views.NotApplicableView.as_view(), name='report_section_not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/auditor_comment$', report_section_views.AuditorCommentSubmitView.as_view(), name='report_section_auditor_comment_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/comment$', report_section_views.PMCommentSubmitView.as_view(), name='report_section_pm_comment_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/audit_date$', audit_store_views.AuditStoreIdAuditDateView.as_view(), name='audit_store_id_audit_date_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', audit_store_views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/moderator$', moderator_views.ModeratorByAuditCycle.as_view(), name='moderator_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_cycle_xlsx_report$', audit_cycle_views.AuditCycleXlsxReport.as_view(), name='audit_cycle_xlsx_report'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/stats$', audit_cycle_views.AuditCycleStats.as_view(), name='audit_cycle_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/post_approval_description$', audit_cycle_views.AuditCycleIdPostApprovalDescriptionView.as_view(), name='audit_cycle_id_post_approval_description_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment$', audit_cycle_views.PaymentView.as_view(), name='audit_cycle_payment_view'),
    url(r'audit_cycle/dashboard$', audit_cycle_views.AuditCycleDashboard.as_view(), name='audit_cycle_dashboard'),


    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),

    url(r'application/(?P<application_id>[0-9]+)/approve$', views.AuditApplicationApproveView.as_view(), name='audit_application_approve_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/assign$', audit_views.AuditFiatAssignView.as_view(), name='audit_fiat_assign_view'),
    url(r'audit/(?P<audit_id>[0-9]+)$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', audit_views.AuditView.as_view(), name='audit_view'),

    url(r'location/(?P<location_id>[0-9]+)$', views.LocationIdView.as_view(), name='location_id_view'),
    url(r'location$', views.LocationView.as_view(), name='location_view'),

    url(r'auditor/(?P<auditor_id>[0-9]+)/profile_info$', auditor_views.AuditorProfileInfoView.as_view(), name='auditor_profile_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/bank_info$', auditor_views.AuditorBankInfoView.as_view(), name='auditor_bank_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/additional_info$', auditor_views.AuditorAdditionalInfoView.as_view(), name='auditor_additional_info_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/verify$', auditor_views.AuditorVerifyView.as_view(), name="auditor_id_verify_view"),
    url(r'auditor/(?P<auditor_id>[0-9]+)/applications$', auditor_views.AuditorApplicationView.as_view(), name='auditor_application_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/reports$', auditor_views.AuditorAuditStoreView.as_view(), name='auditor_audit_store_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/deactivate$', auditor_views.AuditorDeactivateView.as_view(), name="auditor_id_deactivate_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/activate$', auditor_views.AuditorActivateView.as_view(), name="auditor_id_activate_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/payment$', auditor_views.PaymentView.as_view(), name="auditor_payment_view"),
    url(r'auditor/(?P<auditor_id>[0-9]+)$', auditor_views.AuditorIdView.as_view(), name='auditor_id_view'),
    url(r'auditor$', auditor_views.AuditorView.as_view(), name='auditor_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/section$', section_views.SectionViewByAuditCycle.as_view(), name='section_by_audit_cycle'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/section/copy$', section_views.SectionCopyByAuditCycle.as_view(), name='section_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', audit_cycle_views.AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', audit_cycle_views.AuditCycleView.as_view(), name='audit_cycle_view'),

    url(r'section/(?P<section_id>[0-9]+)/question$', question_views.QuestionViewBySection.as_view(), name='question_view_by_section'),
    url(r'section/(?P<section_id>[0-9]+)$', section_views.SectionIdView.as_view(), name='section_id_view'),
    url(r'section$', section_views.SectionView.as_view(), name='section_view'),

    url(r'question/(?P<question_id>[0-9]+)$', question_views.QuestionIdView.as_view(), name='question_id_view'),
    url(r'question$', question_views.QuestionView.as_view(), name='question_view'),

    url(r'client_user/(?P<client_user_id>[0-9]+)$', client_user_views.ClientUserIdView.as_view(), name='client_user_id_view'),
    url(r'client_user$', client_user_views.ClientUserView.as_view(), name='client_user_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', attachment_views.AttachmentCompleteView.as_view(), name='attachment_id_complete_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/rename$', attachment_views.AttachmentIdRenameView.as_view(), name='attachment_id_rename_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', attachment_views.AttachmentIdView.as_view(), name='attachment_id_view'),
    url(r'moderator/(?P<user_id>[0-9]+)$', moderator_views.ModeratorIdView.as_view(), name='moderator_id_view'),
    url(r'moderator$', moderator_views.ModeratorView.as_view(), name='moderator_view'),

], 'manager')
