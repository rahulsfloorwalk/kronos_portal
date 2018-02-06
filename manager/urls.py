from django.conf.urls import url
from .viewss import city as city_views
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
from .viewss import manager as manager_views
from .viewss import email_log as email_log_views
from .viewss import opportunity_email as opportunity_email_views
from .viewss import social as social_views
from .viewss import payment as payment_views
from .viewss import application as application_views
from .viewss import config as config_views

urlpatterns = ([
    url(r'notifications$', notification_views.NotificationsView.as_view(), name='notifications_view'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)$', report_stats_views.AuditCycleStoreSectionAverageReport.as_view(), name='audit_cycle_store_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)$', report_stats_views.AuditCycleCitySectionAverageReport.as_view(), name='audit_cycle_city_section_average'),

    url(r'state$', city_views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', city_views.CityView.as_view(), name='city_view'),

    url(r'client/(?P<client_id>[0-9]+)/client_user$', client_user_views.ClientUserByClientView.as_view(), name='client_user_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/audit_cycle$', audit_cycle_views.AuditCycleViewByClient.as_view(), name='audit_cycle_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store$', store_views.StoreViewByClient.as_view(), name='store_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client/(?P<client_id>[0-9]+)/audit_store/(?P<audit_store_id>[0-9]+)/xlsx_report$', audit_store_views.AuditStoreXlsxReport.as_view(), name='audit_store_xlsx_report'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/client_user$', audit_store_views.AuditStoreIdClientUserView.as_view(), name='audit_store_id_client_user_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', attachment_views.AuditStoreAttachmentView.as_view(), name='audit_store_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', audit_store_views.AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', audit_store_views.AuditStoreIdSubmitView.as_view(), name='audit_store_id_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/withdraw$', audit_store_views.AuditStoreIdWithdrawView.as_view(), name='audit_store_id_withdraw_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', audit_store_views.AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/complete$', audit_store_views.AuditStoreIdCompleteView.as_view(), name='audit_store_id_complete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/uncomplete$', audit_store_views.AuditStoreIdUnCompleteView.as_view(), name='audit_store_id_uncomplete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/accept', audit_store_views.AuditStoreIdAcceptView.as_view(), name='audit_store_id_accept_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/reject', audit_store_views.AuditStoreIdRejectView.as_view(), name='audit_store_id_reject_view'),
    url(r'payment/(?P<payment_id>[0-9]+)/pay$', payment_views.PaymentIdPayView.as_view(), name='payment_id_pay_view'),
    url(r'payment/(?P<payment_id>[0-9]+)/unpay', payment_views.PaymentIdUnpayView.as_view(), name='payment_id_unpay_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', answer_views.AnswerByAuditStore.as_view(), name='answers_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/mark$', answer_views.MarkByQuestionAndStore.as_view(), name='mark_by_question_and_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_text$', answer_views.AnswerByQuestionAndStore.as_view(), name='answer_by_question_and_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_comment$', answer_views.AnswerCommentView.as_view(), name='answer_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/not_applicable$', answer_views.AnswerNotApplicableView.as_view(), name='answer_not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', report_section_views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', attachment_views.ReportSectionAttachmentView.as_view(), name='report_section_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/not_applicable$', report_section_views.NotApplicableView.as_view(), name='report_section_not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/auditor_comment$', report_section_views.AuditorCommentSubmitView.as_view(), name='report_section_auditor_comment_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/comment$', report_section_views.PMCommentSubmitView.as_view(), name='report_section_pm_comment_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/audit_date$', audit_store_views.AuditStoreIdAuditDateView.as_view(), name='audit_store_id_audit_date_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator$', audit_store_views.AuditStoreModeratorAssign.as_view(), name='audit_store_moderator_assign_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', audit_store_views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/moderator$', moderator_views.ModeratorByAuditCycle.as_view(), name='moderator_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store/accept$', audit_store_views.AcceptAllCompletedForAuditCycle.as_view(), name='accept_all_completed_for_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_cycle_xlsx_report$', audit_cycle_views.AuditCycleXlsxReport.as_view(), name='audit_cycle_xlsx_report'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/stats$', audit_cycle_views.AuditCycleStats.as_view(), name='audit_cycle_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/application_stats$', audit_cycle_views.AuditCycleApplicationStats.as_view(), name='audit_cycle_application_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/application/deny_all$', audit_cycle_views.AuditCycleRejectAllApplicationsView.as_view(), name='audit_cycle_reject_all_applications_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store_stats$', audit_cycle_views.AuditCycleAuditStoreStats.as_view(), name='audit_cycle_audit_store_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/export_questionnaire', audit_cycle_views.ExportQuestionnaire.as_view(), name='export_questionnaire'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/post_approval_description$', audit_cycle_views.AuditCycleIdPostApprovalDescriptionView.as_view(), name='audit_cycle_id_post_approval_description_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending/csv$', payment_views.PendingPaymentCsvView.as_view(), name='audit_cycle_pending_payment_csv_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending/pay$', payment_views.PayAllPendingPaymentsForAuditCycle.as_view(), name='audit_cycle_pay_all_pending_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending$', payment_views.PendingPaymentView.as_view(), name='audit_cycle_pending_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment$', payment_views.PaymentView.as_view(), name='audit_cycle_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_email$', opportunity_email_views.OpportunityEmailRecordView.as_view(), name='audit_cycle_opportunity_email_view'),
    url(r'audit_cycle/dashboard$', audit_cycle_views.AuditCycleDashboard.as_view(), name='audit_cycle_dashboard'),


    url(r'store/(?P<store_id>[0-9]+)/client_user$', store_views.StoreIdClientUserView.as_view(), name='store_id_client_user_view'),
    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),

    url(r'application/(?P<application_id>[0-9]+)/approve$', application_views.AuditApplicationApproveView.as_view(), name='audit_application_approve_view'),
    url(r'application/(?P<application_id>[0-9]+)/waitlist$', application_views.AuditApplicationWaitListView.as_view(), name='audit_application_waitlist_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', application_views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),
    url(r'application/(?P<application_id>[0-9]+)$', application_views.AuditApplicationIdView.as_view(), name='audit_application_id_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/audit/copy$', audit_views.AuditCopyByAuditCycle.as_view(), name='audit_copy_by_audit_cycle'),
    url(r'audit/(?P<audit_id>[0-9]+)/assign$', audit_views.AuditFiatAssignView.as_view(), name='audit_fiat_assign_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application/deny_all$', audit_views.AuditRejectAllApplicationsView.as_view(), name='audit_id_reject_all_applications_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAudit.as_view(), name='audit_store_by_audit_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', application_views.AuditApplicationsByAuditView.as_view(), name='applications_by_audit_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/hidden$', audit_views.AuditHiddenView.as_view(), name='audit_hidden_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),
    url(r'audit/(?P<audit_id>[0-9]+)$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', audit_views.AuditView.as_view(), name='audit_view'),

    url(r'auditor/(?P<auditor_id>[0-9]+)/preferences$', auditor_views.PreferencesView.as_view(), name='auditor_preferences_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/profile_info$', auditor_views.AuditorProfileInfoView.as_view(), name='auditor_profile_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/bank_info$', auditor_views.AuditorBankInfoView.as_view(), name='auditor_bank_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/additional_info$', auditor_views.AuditorAdditionalInfoView.as_view(), name='auditor_additional_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/facebook_info$', auditor_views.AuditorFacebookInfoView.as_view(), name='auditor_facebook_info_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/verify$', auditor_views.AuditorVerifyView.as_view(), name="auditor_id_verify_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/password_reset$', auditor_views.AuditorPasswordResetEmailView.as_view(), name="auditor_id_send_password_reset_email"),
    url(r'auditor/(?P<auditor_id>[0-9]+)/applications$', auditor_views.AuditorApplicationView.as_view(), name='auditor_application_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/reports$', auditor_views.AuditorAuditStoreView.as_view(), name='auditor_audit_store_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/deactivate$', auditor_views.AuditorDeactivateView.as_view(), name="auditor_id_deactivate_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/activate$', auditor_views.AuditorActivateView.as_view(), name="auditor_id_activate_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/payment$', auditor_views.PaymentView.as_view(), name="auditor_payment_view"),
    url(r'auditor/(?P<auditor_id>[0-9]+)$', auditor_views.AuditorIdView.as_view(), name='auditor_id_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/email$', auditor_views.AuditorIdEmailView.as_view(), name='auditor_id_email_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/mobile_number$', auditor_views.AuditorIdMobileNumberView.as_view(), name='auditor_id_mobile_number_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/attachment$', auditor_views.IdProofAttachmentView.as_view(), name='id_proof_attachment_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/referral$', auditor_views.ReferralView.as_view(), name='auditor_id_referral_view'),
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
    url(r'manager/(?P<user_id>[0-9]+)$', manager_views.ManagerIdView.as_view(), name='manager_id_view'),
    url(r'manager$', manager_views.ManagerView.as_view(), name='manager_view'),

    url(r'email_log/view/(?P<email_log_id>[0-9]+)/text$', email_log_views.EmailLogTextViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/view/(?P<email_log_id>[0-9]+)/html$', email_log_views.EmailLogHTMLViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/view/(?P<email_log_id>[0-9]+)$', email_log_views.EmailLogHTMLViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/(?P<to_email>[0-9a-zA-Z_@\.]+)$', email_log_views.EmailLogByEmail.as_view(), name='email_log_by_email'),
    url(r'twitter_feed/fetch', social_views.FetchTwitterFeedView.as_view(), name='fetch_twitter_feed_view'),
    url(r'config', config_views.ConfigView.as_view(), name='config_view'),

], 'manager')
