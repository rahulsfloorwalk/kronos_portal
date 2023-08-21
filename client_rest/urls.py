from django.conf.urls import url
from . import views
from registration import views_api as viewss_api
from manager.viewss import store as store_views
from manager.viewss import mp_order as mp_order_views
from manager.viewss import client_profile as mp_client_profile
from manager.viewss.mp_order import MpPaymentView as mp_order_payment_view
from manager.viewss.mp_order import MpPaymentCompleteView as mp_order_payment_complete_view

urlpatterns = ([
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)/store$', views.AuditCycleCityStoreAverageReport.as_view(), name='audit_cycle_city_store_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)$', views.AuditCycleStoreSectionAverageReport.as_view(), name='audit_cycle_store_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store/(?P<store_id>[0-9]+)/audit_store$', views.AuditCycleAuditStoreSectionReport.as_view(), name='audit_cycle_audit_store_section'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city/(?P<city_id>[0-9]+)$', views.AuditCycleCitySectionAverageReport.as_view(), name='audit_cycle_city_section_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', views.AuditStoreView.as_view(), name='audit_store_view'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)$', views.AuditCycleCityAverageReport.as_view(), name='audit_cycle_city_average'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/performance/city$', views.AuditCycleCityPerformance.as_view(), name='audit_cycle_city_performance'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/performance/store$', views.AuditCycleStorePerformance.as_view(), name='audit_cycle_store_performance'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/store_trends$', views.DashboardStoreTrends.as_view(), name='dashboard_store_trends'),

    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle_scores$', views.AuditCycleScore.as_view(), name='audit_cycle_score'),

    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/cluster_trends$', views.DashboardClusterWiseTrendsByAuditCycleId.as_view(), name='dashboard_cluster_trends_by_audit_cycle_id'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/region_trends$', views.DashboardRegionWiseTrendsByAuditCycleId.as_view(), name='dashboard_region_trends_by_audit_cycle_id'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/store_trends$', views.DashboardStoreTrendsByAuditCycleId.as_view(), name='dashboard_store_trends_by_audit_cycle_id'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/store_trends_xlsx$', views.DashboardStoreTrendsXlsx.as_view(), name='dashboard_store_trends_xlsx'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/city_trends$', views.DashboardCityWiseTrends.as_view(), name='dashboard_city_trends'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city_trends$', views.DashboardCityWiseTrendsByAuditCycleId.as_view(), name='dashboard_city_trends_by_audit_cycle_id'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/city_trends_xlsx$', views.DashboardCityWiseTrendsXlsx.as_view(), name='dashboard_city_trends_xlsx'),
    url(r'report/audit_cycle/(?P<audit_cycle_id>[0-9]+)/city$', views.AuditCycleCityPerformance.as_view(), name='audit_cycle_city_performance'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/time_series$', views.AuditCycleTimeSeriesReport.as_view(), name='audit_cycle_time_series'),
    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/time_series$', views.AuditCycleTimeSeriesReportByAuditCycleId.as_view(), name='audit_cycle_time_series_by_audit_cycle_id'),

    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/improvable_questions$', views.ImprovableQuestionsByAuditCycleId.as_view(), name='improvable_questions_by_audit_cycle_id'),
    url(r'audit_cycle_improvable_questions_xlsx$', views.ImprovableQuestionsXlsxReport.as_view(), name='audit_cycle_improvable_questions_xlsx'),

    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/audit_cycle/(?P<audit_cycle_id>[0-9]+)/questionnaire_survey$', views.QuestionnaireSurveyByAuditCycleId.as_view(), name='questionnaire_survey_by_audit_cycle_id'),
    url(r'audit_cycle_questionnaire_survey_xlsx$', views.QuestionnaireSurveyXlsxReport.as_view(), name='audit_cycle_questionnaire_survey_xlsx'),

    url(r'dashboard/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/time_series_xlsx$', views.AuditCycleTimeSeriesReportXlsx.as_view(), name='audit_cycle_time_series_xlsx'),
    url(r'report/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/store/(?P<store_id>[0-9]+)/marking_graph', views.MarkingGraphByStore.as_view(), name='marking_graph_by_store'),
    url(r'report/questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/store/(?P<store_id>[0-9]+)/marking', views.MarkingByStore.as_view(), name='marking_by_store'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_cycle_filtered_xlsx_report$', views.AuditCycleFilteredXlsxReport.as_view(), name='audit_cycle_filtered_xlsx_report'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/report_browser_filtered_xlsx_report$', views.ReportBrowserFilteredXlsxReport.as_view(), name='report_browser_filtered_xlsx_report'),
    url(r'audit_cycle_year_list$',views.AuditCycleYearList.as_view(), name='audit_cycle_year_list'),
    url(r'audit_cycle_wise_xlsx_report$',views.AllStoresAuditCycleWiseXlsxReport.as_view(), name='audit_cycle_wise_report'),

    url(r'audit_store/latest$', views.AuditStoreLatest.as_view(), name='audit_store_latest'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AttachmentByAuditStore.as_view(), name='attachment_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerByAuditStore.as_view(), name='answer_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionByAuditStore.as_view(), name='section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', views.AttachmentByReportSection.as_view(), name='attachment_by_report_section'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionByAuditStore.as_view(), name='report_section_by_audit_store'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/xlsx_report$', views.AuditStoreXlsxReport.as_view(), name='audit_store_xlsx_report'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/ears_report$', views.AuditStoreEARSReport.as_view(), name='audit_store_ears_report'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/impact_factor$', views.ImpactFactorByAuditStore.as_view(), name='audit_store_impact_factor'),
    url(r'audit_store/upcoming$', views.AuditStoreUpcoming.as_view(), name='audit_store_upcoming'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreIdView.as_view(), name='audit_store_id_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_action$', views.AuditStoreReportActionView.as_view(), name='audit_store_report_action_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/action_reports$', views.ActionReportsView.as_view(), name='action_reports_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/action_reports_xlsx$', views.ActionReportsXlsxView.as_view(), name='action_reports_xlsx'),

    url(r'action_report/(?P<action_plan_id>[0-9]+)/change_status$', views.ActionReportChangeStatus.as_view(), name='action_report_change_status'),

    url(r'store/(?P<store_id>[0-9]+)/audit_store$', views.AuditStoreByStore.as_view(), name='audit_store_by_store'),
    url(r'store/(?P<store_id>[0-9]+)/proof_tag_list$', views.ProofTagListByStore.as_view(), name='proof_tag_list_by_store'),
    url(r'store/(?P<store_id>[0-9]+)/proof_tag_list_by_questionnaire_type$', views.ProofTagListByQuestionnaireType.as_view(), name='proof_tag_list_by_questionnaire_type'),
    url(r'store/(?P<store_id>[0-9]+)/get_proofs_by_tag$', views.ProofsByTag.as_view(), name='proofs_by_tag'),
    url(r'store/(?P<store_id>[0-9]+)$', views.StoreById.as_view(), name='store_by_id'),
    url(r'store$', views.StoreByClient.as_view(), name='store_by_client'),
    url(r'filter_stores$', views.StoreFilter.as_view(), name='filter_stores'),

    url(r'user$', views.ClientUserView.as_view(), name='client_user_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/admin_and_non_admin_user_for_admin$', views.AdminAndNonAdminClientUserView.as_view(), name='admin_and_non_admin_client_user_view'),
    
    url(r'audit_cycle$', views.AuditCycleView.as_view(), name='audit_cycle_view'),
    url(r'audit_cycle_for_dashboard$', views.AuditCycleForDashboardView.as_view(), name='audit_cycle_dashboard_view'),
    url(r'audit_cycle/(?P<audit_type>[A-Z_]+)$', views.AuditCycleByTypeView.as_view(), name='audit_cycle_by_type_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/report_attribute$', views.ReportAttributeByAuditCycleView.as_view(), name='report_attributes_by_audit_cycle_view'),
    url(r'audit_cycle/aggregation$', views.AuditCycleAggregate.as_view(), name='audit_cycle_aggregation'),
    url(r'questionnaire_types$', views.QuestionnaireTypesByClient.as_view(), name='questionnaire_types_by_client_view'),
    url(r'store/(?P<store_id>[0-9]+)/questionnaire_types_list$', views.StoreQuestionnaireTypesList.as_view(), name='store_questionnaire_types_list'),
    url(r'store/(?P<store_id>[0-9]+)/questionnaire_types_list_for_comparison$', views.QuestionnaireTypesListForProofComparison.as_view(), name='questionnaire_types_list_for_proof_comparison'),
    url(r'questionnaire_types_for_dashboard$', views.QuestionnaireTypesForDashboardByClient.as_view(), name='questionnaire_types_for_dashboard_by_client_view'),
    url(r'store_performance$', views.StorePerformanceView.as_view(), name='store_performance_view'),
    url(r'store_performance_store_list_by_percentage$', views.StorePerformanceStoreListByPercentageView.as_view(), name='store_performance_store_list_by_percentage'),
    url(r'email_notification$', views.EmailNotification.as_view(), name='email_notification'),

    url(r'types$', views.AuditTypesByClient.as_view(), name='audit_types_by_client'),
    url(r'city$', views.CityView.as_view(), name='city_view'),
    url(r'config$', views.ConfigView.as_view(), name='config_view'),
    url(r'twitter/handles/(?P<twitter_handle_id>[0-9]+)/feed$', views.TwitterFeedView.as_view(), name='twitter_feed_view'),
    url(r'twitter/handles', views.TwitterHandlesView.as_view(), name='twitter_handles_view'),

    url(r'audit_feedback_report_mail$', views.AuditFeedbackReportMail.as_view(), name="audit_feedback_report_mail"),

    # MarketPlace API
    url(r'market_place/signup_api$', viewss_api.MPSignUpAPI.as_view(), name="mp_signup_api"),
    url(r'market_place/verify_email_by_otp$', viewss_api.MPVerfifyEmailByOtp.as_view(), name="mp_verify_email_by_otp"),
    url(r'market_place/login_api$', viewss_api.MPLogInAPI.as_view(), name="mp_login_api"),
    url(r'market_place/change_password_api$', viewss_api.MPChangePasswordAPI.as_view(), name="mp_teset_password_api"),
    
    url(r'market_place/forgot_password_api$', viewss_api.MPForgotPasswordAPI.as_view(), name="mp_forgot_password_api"),
    url(r'market_place/verify_and_forgot_password_api$', viewss_api.MPVerifyAndForgotPasswordAPI.as_view(), name="mp_verify_and_forgot_password_api"),
    url(r'market_place/verify_and_forgot_password_set_api$', viewss_api.MPSetPasswordAPI.as_view(), name="mp_verify_and_forgot_password_set_api"),
    
    url(r'market_place/logout_api$', viewss_api.MPLogOutAPI.as_view(), name="mp_logout_api"),
    url(r'order_mp$',mp_order_views.MpOrderView.as_view(),name='mp_order_view'),
    url(r'mp_order/(?P<order_id>[0-9]+)$',mp_order_views.MpOrderIdView.as_view(),name='mp_order_id_view'),
    url(r'client_profile$',mp_client_profile.ClientProfileView.as_view(),name='client_profile_view'),
    url(r'mp/store_mp$', store_views.StoreClientView.as_view(), name='store_client_view'),
    url(r'mp/(?P<client_id>[0-9]+)/store_mp_get$', store_views.StoreClientViewGET.as_view(), name='store_client_view_get'),
    url(r'mp/(?P<client_id>[0-9]+)/store_mp/(?P<store_id>[0-9]+)$', store_views.StoreClientIdView.as_view(), name='store_client_id_view'),


    url(r'order/created$',mp_order_views.MpPaymentView.as_view(),name='mp_order_payment_view'),
    url(r'order/complete$',mp_order_views.MpPaymentCompleteView.as_view(),name='mp_order_payment_complete_view'),

    
], 'client_rest')
