from django.conf.urls import url


from . import views
from . import views_api
urlpatterns = ([
    url(r'config$', views.ConfigView.as_view(), name='config_view'),
    url(r'user$', views.UserView.as_view(), name='user_view'),
    url(r'notifications$', views.NotificationsView.as_view(), name='notifications_view'),
    url(r'country$', views.CountryView.as_view(), name='country_view'),
    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'state/(?P<country>[\w\-]+)$', views.StateViewByCountry.as_view(), name='state_view_by_country'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),
    url(r'id_proof/attachment$', views.UserIdProofAttachmentView.as_view(), name="id_proof_upload_view"),

    url(r'dashboard/stats$', views.StatsView.as_view(), name="auditor_stats_view"),
    url(r'dashboard/score$', views.ScoreView.as_view(), name="auditor_score_view"),

    url(r'profile_completion_percentage$', views.ProfilePercentageView.as_view(), name="auditor_profile_percentage_view"),
    url(r'profile_info$', views.ProfileInfoView.as_view(), name="profile_info_view"),
    url(r'mobile_number$', views.MobileNumberView.as_view(), name="mobile_number_view"),
    url(r'whatsapp_number$', views.WhatsappNumberView.as_view(), name="whatsapp_number_view"),
    url(r'certification_marks$', views.CertificationMarksView.as_view(), name="certification_marks_view"),
    
    url(r'tos_accept$', views.TosAcceptView.as_view(), name="tos_accept_view"),
    url(r'preferences$', views.PreferencesView.as_view(), name="preferences_view"),
    url(r'additional_info$', views.AdditionalInfoView.as_view(), name="additional_info_view"),
    url(r'bank_info$', views.BankInfoView.as_view(), name="bank_info_view"),
    url(r'facebook_info$', views.FacebookInfoView.as_view(), name="facebook_info_view"),
    url(r'payment$', views.PaymentView.as_view(), name="payment_view"),
    url(r'payment/status$', views.PaymentStatusView.as_view(), name="payment_status_view"),
    url(r'payment/summary$', views.PaymentSummaryView.as_view(), name="payment_summary"),

    url(r'payment/(?P<payment_id>[0-9]+)/payment_concern$', views.PaymentConcernView.as_view(), name="payment_concern_view"),

    url(r'referral$', views.ReferralView.as_view(), name="referral_view"),

    url(r'audit$', views.AvailableAuditsView.as_view(), name="available_audits"),
    
    url(r'applied_audits$', views.AppliedAuditsView.as_view(), name="applied_audits"),
    
    url(r'audit_by_city$', views.AvailableAuditsByCityView.as_view(), name="available_audits_by_city"),
    url(r'audit/(?P<audit_id>[0-9]+)/application/cancel$', views.AuditApplicationCancelView.as_view(), name="audit_application_cancel_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/application/apply$', views.AuditApplicationApplyView.as_view(), name="audit_application_apply_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/application/reapply$', views.AuditApplicationApplyView.as_view(), name="audit_application_apply_view"),
    
    url(r'audit/(?P<audit_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name="audit_application_view"),
    url(r'audit/(?P<audit_id>[0-9]+)$', views.AuditView.as_view(), name="audit_view"),
    url(r'application$', views.AuditApplicationsView.as_view(), name="audit_applications_view"),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionView.as_view(), name="section_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreView.as_view(), name="audit_store_view"),
    url(r'audit_store$', views.AuditStoresView.as_view(), name="audit_stores_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerListView.as_view(), name="answer_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_summary$', views.AuditStoreIdReportSummaryView.as_view(), name="audit_store_id_report_summary_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/nps_section$', views.AuditStoreIdNpsSectionView.as_view(), name="audit_store_id_nps_section_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionListView.as_view(), name="report_section_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/acknowledge$', views.AuditStoreIdAcknowledgeView.as_view(), name="audit_store_id_acknowledge_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', views.AuditStoreIdSubmitView.as_view(), name="audit_store_id_submit_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', views.AuditStoreIdFailView.as_view(), name="audit_store_id_fail_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/withdraw$', views.AuditStoreIdWithdrawView.as_view(), name="audit_store_id_withdraw_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AuditStoreAttachmentView.as_view(), name="audit_store_upload_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/guildline$', views.AuditGuidelineByAuditStore.as_view(), name='audit_guideline_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', views.ReportSectionAttachmentView.as_view(), name="report_section_attachment_view"),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_concern$', views.AuditStoreReportConcern.as_view(), name="audit_store_report_concern"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_feedback$', views.AuditReportFeedback.as_view(), name="audit_store_report_feedback"),

    url(r'question/(?P<question_id>[0-9]+)/answer$', views.AnswerSubmitView.as_view(), name="answer_submit_view"),
    url(r'question/(?P<question_id>[0-9]+)/answer_comment$', views.AnswerCommentView.as_view(), name="answer_comment_view"),
    url(r'section/(?P<section_id>[0-9]+)/comment$', views.CommentSubmitView.as_view(), name="comment_submit_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', views.AttachmentCompleteView.as_view(), name="attachment_complete_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', views.AttachmentIdView.as_view(), name="attachment_id_view"),
    url(r'attachment/(?P<audit_store_id>[0-9]+)/movetosection_auditor$', views.MoveAttachmentToSection.as_view(), name='move_attachment_to_section_auditor'),
    url(r'attachment/(?P<audit_store_id>[0-9]+)/arrange_attachment$', views.AuditStoreIdArrangeAttachment.as_view(), name='arrange_attachment_by_proof_tags'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/proof_tag$', views.AttachmentIdProofTagView.as_view(), name='attachment_id_proof_tag_view'),

    url(r'proof_notavailable$', views.ProofTagNotAvailableView.as_view(), name='proof_tag_not_available_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/attachment_proof_tag_list$', views.AttachmentProofTagList.as_view(), name='attachment_proof_tag_list'),
    url(r'auditor_self/(?P<user_id>[0-9]+)/deactivate$', views.AuditorSelfDeactivateView.as_view(), name="auditor_self_id_deactivate_view"),


    # API for android App
    url(r'app/signup_api_app$', views_api.AppSignUpAPI.as_view(), name="app_signup_api_app"),
    url(r'app/verify_email_by_otp$', views_api.AppVerfifyEmailByOtp.as_view(), name="mp_verify_email_by_otp"),
    url(r'app/login_api$', views_api.LoginAPI.as_view(), name="login_api"),
    url(r'app/logout_api$', views_api.LogoutAPI.as_view(), name="logout_api"),

    url(r'app/change_password_api$', views_api.ChangePasswordAPI.as_view(), name="change_password_api"),   
    url(r'app/forgot_password_api$', views_api.ForgotPasswordAPI.as_view(), name="forgot_password_api"),
    url(r'^password-reset-confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views_api.PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),
    # url(r'password-reset-confirm/<str:uidb64>/<str:token>$', views_api.auditor_service_api.PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),

    url(r'app/verify_and_forgot_password_api$', views_api.VerifyAndForgotPasswordAPI.as_view(), name="verify_and_forgot_password_api"),
    url(r'app/verify_and_forgot_password_set_api$', views_api.SetPasswordAPI.as_view(), name="verify_and_forgot_password_set_api"),   

    url(r'profile_info/pronouns$', views.ProfileInfoPronounsView.as_view(), name="profile_info_pronouns_view"), 
    url(r'profile_info/gender$', views.ProfileInfoGenderView.as_view(), name="profile_info_gender_view"), 
    url(r'profile_info/marital_status$', views.ProfileInfoMaritalStatusView.as_view(), name="profile_info_marital_status_view"), 
    url(r'profile_info/education$', views.ProfileEducationInfoView.as_view(), name="profile_info_education_view"), 
    
    url(r'profile_info/income$', views.ProfileInfoIncomeView.as_view(), name="profile_info_income_view"), 
    url(r'profile_info/audit_rating$', views.ProfileInfoAuditRatingView.as_view(), name="profile_info_audit_rating_view"), 
    url(r'profile_info/occupation$', views.ProfileInfoOccupationView.as_view(), name="profile_info_occupation_view"), 
    url(r'profile_info/distance$', views.ProfileInfoDistanceView.as_view(), name="profile_info_distance_view"), 
    url(r'profile_info/industry$', views.ProfileInfoIndustryView.as_view(), name="profile_info_industry_view"), 
    url(r'profile_info/car_cost$', views.ProfileInfoCarCostView.as_view(), name="profile_info_car_cost_view"), 
    url(r'profile_info/resolution$', views.ProfileInfoResolutionView.as_view(), name="profile_info_resolution_view"), 

    url(r'dashboard_api$', views_api.DashboardView.as_view(), name="dashboard_view"),
    url(r'auditor_profile_api$', views_api.AuditorProfileView.as_view(), name="auditor_profile_view"),
    url(r'auditor_opportunity_email$', views_api.AuditorOpportunityEmail.as_view(), name="auditor_opportunity_email"),
    url(r'auditor_opportunity_sms$', views_api.AuditorOpportunitySMS.as_view(), name="auditor_opportunity_sms")
], 'auditor')
