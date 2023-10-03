from django.conf.urls import url
from .viewss import city as city_views
from .viewss import auditor as auditor_views
from .viewss import client as client_views
from .viewss import store as store_views
from .viewss import audit as audit_views
from .viewss import audit_store as audit_store_views
from .viewss import audit_cycle as audit_cycle_views
from .viewss import section as section_views
from .viewss import section_proof_tag as section_proof_tag_views
from .viewss import question as question_views
from .viewss import answer as answer_views
from .viewss import client_user as client_user_views
from .viewss import client_manager as client_manager_views
from .viewss import client_trainer as client_trainer_views
from .viewss import report_section as report_section_views
from .viewss import attachment as attachment_views
from .viewss import notifications as notification_views
from .viewss import report_stats as report_stats_views
from .viewss import moderator as moderator_views
from .viewss import manager as manager_views
from .viewss import trainer as trainer_views
from .viewss import proof_tag as proof_tag_views
from .viewss import email_log as email_log_views
from .viewss import opportunity_email as opportunity_email_views
from .viewss import opportunity_notification as opportunity_notification_views
from .viewss import social as social_views
from .viewss import payment as payment_views
from .viewss import application as application_views
from .viewss import config as config_views
from .viewss import questionnaire_type as questionnaire_type_views
from .viewss import agency_user as agency_user_views
from .viewss import report_attribute as report_attribute_views
from .viewss import reports as report_views
from .viewss import tax as tax_views
from .viewss import category as category_views
from .viewss import solution as solution_views
from .viewss import mp_order as mp_order_views
from .viewss import client_profile as mp_client_profile
from .viewss import mp_customer as mp_customer_views
urlpatterns = ([
    url(r'notifications$', notification_views.NotificationsView.as_view(), name='notifications_view'),
    url(r'notifications/actors$', notification_views.NotificationActorsView.as_view(), name='notification_actors_view'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)$', report_stats_views.AuditCycleStoreSectionAverageReport.as_view(), name='audit_cycle_store_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)$', report_stats_views.AuditCycleCitySectionAverageReport.as_view(), name='audit_cycle_city_section_average'),

    url(r'country$', city_views.CountryView.as_view(), name='country_view'),
    url(r'state$', city_views.StateView.as_view(), name='state_view'),
    url(r'(?P<country>[\w\-]+)/state_by_country_id$', city_views.StateViewByCountryId.as_view(), name='state_view_by_country_id'),
    url(r'city/(?P<state>[\w\-]+)$', city_views.CityView.as_view(), name='city_view'),

    url(r'client/(?P<client_id>[0-9]+)/questionnaire_type$', questionnaire_type_views.QuestionnaireTypeByClientView.as_view(), name='questionnaire_type_by_client_view'),
    url(r'client/(?P<client_id>[0-9]+)/client_user$', client_user_views.ClientUserByClientView.as_view(), name='client_user_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/audit_cycle$', audit_cycle_views.AuditCycleViewByClient.as_view(), name='audit_cycle_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/audit_cycle_dashboard$', audit_cycle_views.AuditCycleDashboardStatusViewByClient.as_view(), name='audit_cycle_with_dashboard_status_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store$', store_views.StoreViewByClient.as_view(), name='store_view_by_client'),
    url(r'client/(?P<client_id>[0-9]+)/store/import$', store_views.ImportStoreView.as_view(), name='import_store_view'),
    url(r'client/(?P<client_id>[0-9]+)/store/import/sample$', store_views.StoreSampleXlsxView.as_view(), name='sample_import_store_view'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client/(?P<client_id>[0-9]+)/audit_store/(?P<audit_store_id>[0-9]+)/xlsx_report$', audit_store_views.AuditStoreXlsxReport.as_view(), name='audit_store_xlsx_report'),
    url(r'client/dashboard_cycle_status$', client_views.ClientViewByDashboardCyleStatus.as_view(), name='client_view_by_dashboard_cycle_status'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),
    
    
    # admin dashboard for marketplace
    url(r'tax$', tax_views.TaxView.as_view(), name='tax_view'),
    url(r'tax/(?P<tax_id>[0-9]+)$', tax_views.TaxIdView.as_view(), name='tax_id_view'),
    
    url(r'category$', category_views.CategoryView.as_view(), name='category_view'),
    url(r'category/(?P<category_id>[0-9]+)$', category_views.CategoryIdView.as_view(), name='category_id_view'),
    url(r'category/(?P<category_id>[0-9]+)/attachment$',category_views.CategoryAttachmentView.as_view(),name='category_attachment_view'),
    url(r'category_attachment/(?P<attachment_id>[0-9]+)/delete$',category_views.CategoryDeleteView.as_view(),name='category_delete_view'),
    url(r'category_attachment/(?P<attachment_id>[0-9]+)/complete$',category_views.CategoryAttachmentCompleteView.as_view(),name='category_attachment_complete_view'),
    
    
    url(r'solution$', solution_views.SolutionView.as_view(), name='solution_view'),
    
    url(r'solution/(?P<solution_id>[0-9]+)$', solution_views.SolutionIdView.as_view(), name='solution_id_view'),
    
    
    url(r'solution_status/(?P<solution_id>[0-9]+)$', solution_views.SolutionStatusIdView.as_view(), name='solution_status_id_view'),
    url(r'solution_show_status/(?P<solution_id>[0-9]+)$', solution_views.SolutionStatusShowView.as_view(), name='solution_status_show_view'),  
    url(r'popular_status/(?P<solution_id>[0-9]+)$', solution_views.SolutionPopularStatusIdView.as_view(), name='solution_popular_status_id_view'),
    
    
    url(r'solution_archieved$', solution_views.ArchievedSolutionView.as_view(), name='archieved_solution_view'),
    
    url(r'solution/(?P<solution_id>[0-9]+)/attachment$',solution_views.SolutionAttachmentView.as_view(),name='solution_attachment_view'),
    
    url(r'attachment/(?P<attachment_id>[0-9]+)/delete$',solution_views.SolutionDeleteView.as_view(),name='solution_delete_view'),
    url(r'solution_attachment/(?P<attachment_id>[0-9]+)/complete$',solution_views.SolutionAttachmentCompleteView.as_view(),name='solution_attachment_complete_view'),
    
    url(r'solution_question_add$',solution_views.SolutionQuestionAddView.as_view(),name='solution_question_add_view'),
    url(r'solution/(?P<solution_id>[0-9]+)/question$', solution_views.QuestionViewBySolution.as_view(), name='question_view_by_solution'),
    url(r'solution_question/(?P<question_id>[0-9]+)$', solution_views.SolutionQuestionIdView.as_view(), name='solution_question_id_view'),
    
    url(r'solution/(?P<solution_id>[0-9]+)/solution_proof_tag$', solution_views.SolutionProofTag.as_view(), name='solution_proof_tag'),
    
    url(r'solution/other_details$', solution_views.SolutionOtherDetailsAddView.as_view(), name='solution_other_details_add_view'),
    url(r'solution/(?P<solution_id>[0-9]+)/other_detail$', solution_views.SolutionIdOtherDetailsAddView.as_view(), name='solution_id_other_details_add_view'),
    url(r'solution/(?P<detail_id>[0-9]+)/other_details$', solution_views.SolutionOtherDetailsView.as_view(), name='solution_other_details_view'),
    url(r'mp_order_status/',mp_order_views.MpOrderStatusView.as_view(),name='mp_order_status_view'),
    url(r'mp_all_count$',mp_customer_views.MpCountsView.as_view(),name='mp_counts_view'),
    url(r'order$',mp_order_views.AdminOrderView.as_view(),name='admin_order_view'),
    url(r'mp/active_customer$',mp_customer_views.MpCustomerView.as_view(),name='mp_customer_view'),
    
    
    # Market place User Dashboard WithOut Loggedin
    url(r'public_tax$', tax_views.PublicTaxView.as_view(), name='public_tax_view'),
    url(r'public_tax/(?P<tax_id>[0-9]+)$', tax_views.PublicTaxIdView.as_view(), name='public_tax_id_view'),
    url(r'category_public$', category_views.PublicCategoryView.as_view(), name='public_category_view'),
    url(r'public_category/(?P<category_id>[0-9]+)/solution_detail$', category_views.PublicCategoryIdBySolutionView.as_view(), name='public_category_id_solution_view'),
    url(r'public_category/(?P<category_id>[0-9]+)$', category_views.PublicCategoryIdView.as_view(), name='public_category_id_view'),
    url(r'public_category/(?P<category_id>[0-9]+)/attachment$',category_views.PublicCategoryAttachmentView.as_view(),name='public_category_attachment_view'),
    url(r'public_solution$', solution_views.PublicSolutionView.as_view(), name='public_solution_view'),
    url(r'public_solution/(?P<solution_id>[0-9]+)$', solution_views.PublicSolutionIdView.as_view(), name='public_solution_id_view'),
    url(r'public_solution/(?P<solution_id>[0-9]+)/full_details$', solution_views.PublicSolutionIdFullDetailsView.as_view(), name='public_solution_id_full_details_view'),
    url(r'solution_popular$', solution_views.SolutionPopularView.as_view(), name='solution_popular_status_id_view'),
    url(r'public_solution/(?P<solution_id>[0-9]+)/attachment$',solution_views.PublicSolutionAttachmentView.as_view(),name='public_solution_attachment_view'),
    url (r'cat/(?P<category_id>[0-9]+)/solution_details',solution_views.SolutionViewByCategoryIdView.as_view(),name='solution_view_by_category_id'),
    
    # For Loggedin User 
    url(r'mp_order_list$',mp_order_views.MPOrderList.as_view(),name='mp_order_list_view'),
    # url(r'mp_order$',mp_order_views.MpOrderView.as_view(),name='mp_order_view'),
    # url(r'mp_order/(?P<order_id>[0-9]+)$',mp_order_views.MpOrderIdView.as_view(),name='mp_order_id_view'),
    # url(r'client_profile$',mp_client_profile.ClientProfileView.as_view(),name='client_profile_view'),
    # url(r'store/(?P<user_id>[0-9]+)/mp$', store_views.StoreUserIdView.as_view(), name='store_user_id_view'),

    # url(r'order/created$',mp_order_views.MpPaymentView.as_view(),name='mp_order_payment_view'),
    url(r'order/complete$',mp_order_views.MpPaymentCompleteView.as_view(),name='mp_order_payment_complete_view'),

    # -----------------------------------------
  
    url(r'client_user_add$', client_views.ClientUserAdd.as_view(),name='client_user_add'), 
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/client_user$', audit_store_views.AuditStoreIdClientUserView.as_view(), name='audit_store_id_client_user_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', attachment_views.AuditStoreAttachmentView.as_view(), name='audit_store_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', audit_store_views.AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', audit_store_views.AuditStoreIdSubmitView.as_view(), name='audit_store_id_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/withdraw$', audit_store_views.AuditStoreIdWithdrawView.as_view(), name='audit_store_id_withdraw_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', audit_store_views.AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/revert_report$', audit_store_views.AuditStoreIdRevertReportView.as_view(), name='audit_store_id_revert_report_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/qa_ok$', audit_store_views.AuditStoreIdQAOKView.as_view(), name='audit_store_id_qa_ok_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/pm_revert$', audit_store_views.AuditStoreIdPMRevertView.as_view(), name='audit_store_id_pm_revert_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/complete$', audit_store_views.AuditStoreIdCompleteView.as_view(), name='audit_store_id_complete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/uncomplete$', audit_store_views.AuditStoreIdUnCompleteView.as_view(), name='audit_store_id_uncomplete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/accept', audit_store_views.AuditStoreIdAcceptView.as_view(), name='audit_store_id_accept_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/reject', audit_store_views.AuditStoreIdRejectView.as_view(), name='audit_store_id_reject_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/arrange_attachment$', audit_store_views.AuditStoreIdArrangeAttachment.as_view(), name='audit_store_id_arrange_attachment'),

    url(r'payment/(?P<payment_id>[0-9]+)/pay$', payment_views.PaymentIdPayView.as_view(), name='payment_id_pay_view'),
    url(r'payment/(?P<payment_id>[0-9]+)/fail', payment_views.PaymentIdFailView.as_view(), name='payment_id_fail_view'),
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
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator_status$', audit_store_views.AuditStoreIdModeratorStatusView.as_view(), name='audit_store_id_moderator_status_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator_comment$', audit_store_views.AuditStoreIdModeratorCommentView.as_view(), name='audit_store_id_moderator_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/qa_rating$', audit_store_views.AuditStoreIdQARatingView.as_view(), name='audit_store_id_qa_rating_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/auditor_rating$', audit_store_views.AuditStoreAuditorRatingView.as_view(), name='audit_store_id_auditor_rating_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_attribute', audit_store_views.AuditStoreIdReportAttributeView.as_view(), name='audit_store_id_report_attribute_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/reimbursement$', audit_store_views.AuditStoreIdReimbursementView.as_view(), name='audit_store_id_reimbursement_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/earnings_per_audit$', audit_store_views.AuditStoreIdEarningsPerAuditView.as_view(), name='audit_store_id_earnings_per_audit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator$', audit_store_views.AuditStoreModeratorAssign.as_view(), name='audit_store_moderator_assign_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_summary$', audit_store_views.AuditStoreIdReportSummaryView.as_view(), name='audit_store_id_report_summary_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/check_points$', audit_store_views.AuditStoreIdCheckPoints.as_view(), name='audit_store_id_check_points'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/follow_up$', audit_store_views.AuditStoreIdFollowUp.as_view(), name='audit_store_id_follow_up'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', audit_store_views.AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/moderator_summary$', moderator_views.ModeratorSummaryByAuditCycle.as_view(), name='moderator_summary_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/moderator$', moderator_views.ModeratorByAuditCycle.as_view(), name='moderator_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store/accept$', audit_store_views.AcceptAllCompletedForAuditCycle.as_view(), name='accept_all_completed_for_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store_new$', audit_store_views.AuditStoreByAuditCycleNew.as_view(), name='audit_store_by_audit_cycle_new_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/user_list_for_reports_filter$', audit_store_views.UserListForReportsFilter.as_view(), name='user_list_for_reports_filter_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/application_stats$', audit_cycle_views.AuditCycleApplicationStats.as_view(), name='audit_cycle_application_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/application/deny_all$', audit_cycle_views.AuditCycleRejectAllApplicationsView.as_view(), name='audit_cycle_reject_all_applications_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store_stats$', audit_cycle_views.AuditCycleAuditStoreStats.as_view(), name='audit_cycle_audit_store_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/export_questionnaire', audit_cycle_views.ExportQuestionnaire.as_view(), name='export_questionnaire'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/post_approval_description$', audit_cycle_views.AuditCycleIdPostApprovalDescriptionView.as_view(), name='audit_cycle_id_post_approval_description_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/eligibility_auditors$', audit_cycle_views.AuditCycleIdEligibilityAuditorView.as_view(), name='audit_cycle_id_eligibility_auditor_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/checkpoints$', audit_cycle_views.AuditCycleIdCheckPointsView.as_view(), name='audit_cycle_id_checkpoints'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/charge_per_audit$', audit_cycle_views.AuditCycleIdChargePerAuditView.as_view(), name='audit_cycle_id_charge_per_audit'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/system_cost$', audit_cycle_views.AuditCycleIdSystemCostView.as_view(), name='audit_cycle_id_system_cost'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_alignment_factors', audit_cycle_views.AuditAlignmentFactors.as_view(), name='audit_alignment_factor'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending/csv$', payment_views.PendingPaymentCsvView.as_view(), name='audit_cycle_pending_payment_csv_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending/xlsx', payment_views.PendingPaymentXlsxView.as_view(), name='audit_cycle_pending_payment_xlsx_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending/pay$', payment_views.PayAllPendingPaymentsForAuditCycle.as_view(), name='audit_cycle_pay_all_pending_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment/pending$', payment_views.PendingPaymentView.as_view(), name='audit_cycle_pending_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/payment$', payment_views.PaymentView.as_view(), name='audit_cycle_payment_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_email$', opportunity_email_views.OpportunityEmailRecordView.as_view(), name='audit_cycle_opportunity_email_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_sms$', opportunity_email_views.OpportunitySMSRecordView.as_view(), name='audit_cycle_opportunity_sms_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_whatsapp$', opportunity_email_views.OpportunityWhatsappRecordView.as_view(), name='audit_cycle_opportunity_whatsapp_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_notification$', opportunity_notification_views.OpportunityNotificationView.as_view(), name='audit_cycle_opportunity_notification_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/opportunity_notification_for_pincode$', opportunity_notification_views.OpportunityNotificationForPincodeView.as_view(), name='audit_cycle_opportunity_notification_for_pincode_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/report_attribute$', report_attribute_views.ReportAttributeView.as_view(), name='report_attribute_by_audit_cycle_view'),
    # url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/client_from_details$', audit_cycle_views.AuditCycleDetailsFromClientView.as_view(), name='audit_cycle_id_details_from_client_view'),
    url(r'audit_cycle/dashboard$', audit_cycle_views.AuditCycleDashboard.as_view(), name='audit_cycle_dashboard'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/proof_tag', proof_tag_views.AuditCycleProofTag.as_view(), name='audit_cycle_proof_tag'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/attachment_proof_tag_list', proof_tag_views.AttachmentAuditCycleProofTagList.as_view(), name='attachment_audit_cycle_proof_tag'),

    url(r'store/(?P<store_id>[0-9]+)/client_user$', client_user_views.ClientUserByStoreIdView.as_view(), name='client_user_by_store_id_view'),
    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),

    url(r'application/(?P<application_id>[0-9]+)/comment$', application_views.AuditApplicationCommentView.as_view(), name='audit_application_comment_view'),
    url(r'application/(?P<application_id>[0-9]+)/approve$', application_views.AuditApplicationApproveView.as_view(), name='audit_application_approve_view'),
    url(r'application/(?P<application_id>[0-9]+)/waitlist$', application_views.AuditApplicationWaitListView.as_view(), name='audit_application_waitlist_view'),
    url(r'application/(?P<application_id>[0-9]+)/reject$', application_views.AuditApplicationRejectView.as_view(), name='audit_application_reject_view'),
    url(r'application/(?P<application_id>[0-9]+)$', application_views.AuditApplicationIdView.as_view(), name='audit_application_id_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/audit/copy$', audit_views.AuditCopyByAuditCycle.as_view(), name='audit_copy_by_audit_cycle'),

    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/copy_audit_details$', audit_cycle_views.AuditDetailsCopyByAuditCycle.as_view(), name='audit_details_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/rem_store$',audit_views.RemainingAuditStore.as_view(), name='remaining_audit_store'),

    url(r'audit/(?P<audit_id>[0-9]+)/assign$', audit_views.AuditFiatAssignView.as_view(), name='audit_fiat_assign_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application/deny_all$', audit_views.AuditRejectAllApplicationsView.as_view(), name='audit_id_reject_all_applications_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/audit_store$', audit_store_views.AuditStoreByAudit.as_view(), name='audit_store_by_audit_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', application_views.AuditApplicationsByAuditView.as_view(), name='applications_by_audit_id_view'),
    url(r'audit/(?P<audit_id>[0-9]+)/hidden$', audit_views.AuditHiddenView.as_view(), name='audit_hidden_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),
    
    
    url(r'audit/(?P<audit_id>[0-9]+)$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', audit_views.AuditView.as_view(), name='audit_view'),

    url(r'auditor/(?P<auditor_id>[0-9]+)/group_rating$', auditor_views.GroupRatingView.as_view(), name='auditor_group_rating_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/preferences$', auditor_views.PreferencesView.as_view(), name='auditor_preferences_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/auditor_rating$', auditor_views.AuditorRatingView.as_view(), name='auditor_rating_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/profile_info$', auditor_views.AuditorProfileInfoView.as_view(), name='auditor_profile_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/bank_info$', auditor_views.AuditorBankInfoView.as_view(), name='auditor_bank_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/additional_info$', auditor_views.AuditorAdditionalInfoView.as_view(), name='auditor_additional_info_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/facebook_info$', auditor_views.AuditorFacebookInfoView.as_view(), name='auditor_facebook_info_view'),
    url(r'auditor/(?P<user_id>[0-9]+)/verify$', auditor_views.AuditorVerifyView.as_view(), name="auditor_id_verify_view"),
    url(r'auditor/(?P<user_id>[0-9]+)/password_reset$', auditor_views.AuditorPasswordResetEmailView.as_view(), name="auditor_id_send_password_reset_email"),
    url(r'auditor/(?P<auditor_id>[0-9]+)/applications$', auditor_views.AuditorApplicationView.as_view(), name='auditor_application_view'),
    url(r'auditor/(?P<auditor_id>[0-9]+)/completed_accepted_reports$', auditor_views.AuditorCompletedAcceptedAuditStoreView.as_view(), name='auditor_completed_accepted_audit_store_view'),
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
    url(r'auditor/summary$', auditor_views.AuditorSummaryView.as_view(), name='auditor_summary_view'),
    url(r'auditor/filter_count$', opportunity_email_views.AuditorCountByFilterView.as_view(), name='auditor_count_filter_view'),
    # url(r'auditor/(?P<audit_cycle_id>[0-9]+)/all_filter_count$',opportunity_email_views.AuditorAllLocationCountByFilterView.as_view(), name='auditor_all_location_count_by_filter_view'),
    url(r'agency_user/city_id/(?P<city_id>[0-9]+)$', agency_user_views.AgencyUserByPresenceInCityIdView.as_view(), name='agency_user_by_presence_in_city_id_view'),
    url(r'agency_user/(?P<user_id>[0-9]+)$', agency_user_views.AgencyUserIdView.as_view(), name='agency_user_id_view'),
    url(r'agency_user$', agency_user_views.AgencyUserSearchView.as_view(), name='agency_user_search_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/section$', section_views.SectionViewByAuditCycle.as_view(), name='section_by_audit_cycle'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/section/copy$', section_views.SectionCopyByAuditCycle.as_view(), name='section_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', audit_cycle_views.AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', audit_cycle_views.AuditCycleView.as_view(), name='audit_cycle_view'),

    url(r'audit_cycle/(?P<manager_id>[0-9]+)/manager$', audit_cycle_views.AuditCycleViewByManager.as_view(), name='audit_cycle_by_manager'),

    url(r'section/(?P<section_id>[0-9]+)/question$', question_views.QuestionViewBySection.as_view(), name='question_view_by_section'),
    url(r'section/(?P<section_id>[0-9]+)$', section_views.SectionIdView.as_view(), name='section_id_view'),
    url(r'section$', section_views.SectionView.as_view(), name='section_view'),

    url(r'section/(?P<section_id>[0-9]+)/proof_tag$', section_proof_tag_views.SectionProofTag.as_view(), name='question_view_by_section'),

    url(r'question/(?P<question_id>[0-9]+)$', question_views.QuestionIdView.as_view(), name='question_id_view'),
    url(r'question$', question_views.QuestionView.as_view(), name='question_view'),

    url(r'client_user/(?P<client_user_id>[0-9]+)$', client_user_views.ClientUserIdView.as_view(), name='client_user_id_view'),
    url(r'client_user$', client_user_views.ClientUserView.as_view(), name='client_user_view'),
    url(r'client_user/(?P<client_user_id>[0-9]+)/assign_stores$', client_user_views.ClientUserAssignStoresView.as_view(), name='client_user_assign_stores_view'),

    url(r'client/(?P<client_id>[0-9]+)/client_manager$', client_manager_views.ClientManagerByClientView.as_view(), name='client_manager_view_by_client'),
    url(r'client_manager$', client_manager_views.ClientManagerView.as_view(), name='client_manager_view'),
    url(r'client_manager/(?P<client_manager_id>[0-9]+)$', client_manager_views.ClientManagerIdView.as_view(), name='client_manager_id_view'),

    url(r'client/(?P<client_id>[0-9]+)/client_trainer$', client_trainer_views.ClientTrainerByClientView.as_view(), name='client_trainer_view_by_client'),
    # url(r'client/(?P<client_id>[0-9]+)/client_requirements',client_requirements_views.ClientRequirementsView.as_view(), name='client_requirements_view')
    url(r'client_trainer$', client_trainer_views.ClientTrainerView.as_view(), name='client_trainer_view'),
    url(r'client_trainer/(?P<client_trainer_id>[0-9]+)$', client_trainer_views.ClientTrainerIdView.as_view(), name='client_trainer_id_view'),

    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', attachment_views.AttachmentCompleteView.as_view(), name='attachment_id_complete_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/rename$', attachment_views.AttachmentIdRenameView.as_view(), name='attachment_id_rename_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/proof_tag', attachment_views.AttachmentIdProofTagView.as_view(), name='attachment_id_proof_tag_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', attachment_views.AttachmentIdView.as_view(), name='attachment_id_view'),
    url(r'attachment/(?P<audit_store_id>[0-9]+)/movetosection_manager$', attachment_views.MoveAttachmentToSection.as_view(), name='move_attachment_to_section_manager'),

    url(r'attachment/(?P<attachment_id>[0-9]+)/rotate$', attachment_views.AttachmentIdRotateView.as_view(), name='attachment_id_rotate_view'),

    url(r'moderator/(?P<user_id>[0-9]+)$', moderator_views.ModeratorIdView.as_view(), name='moderator_id_view'),
    url(r'moderator/summary$', moderator_views.ModeratorSummaryView.as_view(), name='moderator_summary_view'),
    url(r'moderator/(?P<user_id>[0-9]+)/reportlist$', moderator_views.ModeratorReportList.as_view(), name='moderator_report_list'),
    url(r'moderator$', moderator_views.ModeratorView.as_view(), name='moderator_view'),
    url(r'manager/(?P<user_id>[0-9]+)$', manager_views.ManagerIdView.as_view(), name='manager_id_view'),
    url(r'manager$', manager_views.ManagerView.as_view(), name='manager_view'),

    url(r'trainer/(?P<user_id>[0-9]+)$', trainer_views.TrainerIdView.as_view(), name='trainer_id_view'),
    url(r'trainer$', trainer_views.TrainerView.as_view(), name='trainer_view'),

    url(r'proof_tag$', proof_tag_views.ProofTagView.as_view(), name='proof_tag_views'),
    url(r'proof_tag/(?P<proof_tag_id>[0-9]+)$', proof_tag_views.ProofTagIdView.as_view(), name='proof_tag_id_view'),
    url(r'(?P<proof_tag_id>[0-9]+)/clients_list$',proof_tag_views.ProofTagClientsView.as_view(), name='proof_tag_clients_view'),
    url(r'email_log/view/(?P<email_log_id>[0-9]+)/text$', email_log_views.EmailLogTextViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/view/(?P<email_log_id>[0-9]+)/html$', email_log_views.EmailLogHTMLViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/view/(?P<email_log_id>[0-9]+)$', email_log_views.EmailLogHTMLViewById.as_view(), name='email_log_view_by_id'),
    url(r'email_log/(?P<to_email>[0-9a-zA-Z_@\.]+)$', email_log_views.EmailLogByEmail.as_view(), name='email_log_by_email'),
    # url(r'twitter_feed/fetch', social_views.FetchTwitterFeedView.as_view(), name='fetch_twitter_feed_view'),
    url(r'config', config_views.ConfigView.as_view(), name='config_view'),
    url(r'questionnaire_type/(?P<questionnaire_type_id>[0-9]+)$', questionnaire_type_views.QuestionnaireTypeIdView.as_view(), name='questionnaire_type_id_view'),
    url(r'questionnaire_type$', questionnaire_type_views.QuestionnaireTypeView.as_view(), name='questionnaire_type_view'),

    url(r'reports/auditor_payment/', report_views.AuditPaymentReportView.as_view(), name="auditor_payment_report"),
    url(r'reports/billing/', report_views.BilingReportView.as_view(), name="billing_report"),
    url(r'reports/profitability/', report_views.ProfitablityReportView.as_view(), name="profitability_report"),
    url(r'reports/project_cost/export', report_views.ProjectCostXlsxReport.as_view(), name="project_cost_report_export"),
    url(r'reports/project_cost/', report_views.ProjectCostReportView.as_view(), name="project_cost_report"),
    url(r'reports/monthly_pnl/', report_views.MonthlyPNLReportView.as_view(), name="monthly_pnl_report"),
    url(r'reports/manager_wise_profitability/', report_views.ManagerWiseProfitabilityView.as_view(), name="manager_wise_profitability_report"),
    url(r'reports/client_wise_profitability/', report_views.ClientWiseProfitabilityView.as_view(), name="client_wise_profitability_report"),
    url(r'reports/qa_report/', report_views.QAWiseReport.as_view(), name="qa_report"),
    url(r'reports/follow_up_report/', report_views.FollowUpReport.as_view(), name="follow_up_report"),

    url(r'analytics/project_analytic_cycle_wise$', auditor_views.ProjectAnalyticCycleWiseView.as_view(), name='project_analytic_cycle_wise'),
    url(r'analytics/project_analytic_month_wise$', auditor_views.ProjectAnalyticMonthWiseView.as_view(), name='project_analytic_month_wise'),
], 'manager')
