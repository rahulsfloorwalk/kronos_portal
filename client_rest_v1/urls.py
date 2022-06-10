from django.conf.urls import url
from .views import city as city_views
from .views import audit_cycle as audit_cycle_views
from .views import questionnaire_type as questionnaire_type_views
from .views import questionnaire as questionnaire_views
from .views import client as client_views
from .views import store as store_views
from .views import client_user as client_user_views
from .views import section as section_views
from .views import section_proof_tag as section_proof_tag_views
from .views import question as question_views
from .views import audit as audit_views
from .views import payment as payment_views
from .views import quotation as quotation_views


urlpatterns = ([

    url(r'country$', city_views.CountryView.as_view(), name='country_view'),
    url(r'state$', city_views.StateView.as_view(), name='state_view'),
    url(r'(?P<country>[\w\-]+)/state_by_country_id$', city_views.StateViewByCountryId.as_view(), name='state_view_by_country_id'),
    url(r'city/(?P<state>[\w\-]+)$', city_views.CityView.as_view(), name='city_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/sample_questionnaire/(?P<sample_questionnaire_id>[0-9]+)/insert$', questionnaire_views.SampleQuestionnaireInsertView.as_view(), name='sample_questionnaire_insert_view'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/audit/copy$', audit_views.AuditCopyByAuditCycle.as_view(), name='audit_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit$', audit_views.AuditByAuditCycle.as_view(), name='audit_by_audit_cycle_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/application_stats$', audit_cycle_views.AuditCycleApplicationStats.as_view(), name='audit_cycle_application_stats'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/post_approval_description$', audit_cycle_views.AuditCycleIdPostApprovalDescriptionView.as_view(), name='audit_cycle_id_post_approval_description_view'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/checkpoints$', audit_cycle_views.AuditCycleIdCheckPointsView.as_view(), name='audit_cycle_id_checkpoints'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_alignment_factors$', audit_cycle_views.AuditAlignmentFactors.as_view(), name='audit_alignment_factor'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/copy_audit_details$', audit_cycle_views.AuditDetailsCopyByAuditCycle.as_view(), name='audit_details_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/section$', section_views.SectionViewByAuditCycle.as_view(), name='section_by_audit_cycle'),
    url(r'audit_cycle/(?P<to_audit_cycle_id>[0-9]+)/section/copy$', section_views.SectionCopyByAuditCycle.as_view(), name='section_copy_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/export_questionnaire$', audit_cycle_views.ExportQuestionnaire.as_view(), name='export_questionnaire'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', audit_cycle_views.AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', audit_cycle_views.AuditCycleView.as_view(), name='audit_cycle_view'),

    url(r'section/(?P<section_id>[0-9]+)/proof_tag$', section_proof_tag_views.SectionProofTag.as_view(), name='question_view_by_section'),
    url(r'section/(?P<section_id>[0-9]+)/question$', question_views.QuestionViewBySection.as_view(), name='question_view_by_section'),
    url(r'section/(?P<section_id>[0-9]+)$', section_views.SectionIdView.as_view(), name='section_id_view'),
    url(r'section$', section_views.SectionView.as_view(), name='section_view'),

    url(r'question/(?P<question_id>[0-9]+)$', question_views.QuestionIdView.as_view(), name='question_id_view'),
    url(r'question$', question_views.QuestionView.as_view(), name='question_view'),

    url(r'audit_cycle/dashboard/summary$', audit_cycle_views.AuditCycleDashboardSummaryView.as_view(), name='audit_cycle_dashboard_summary_view'),
    url(r'audit_cycle/dashboard$', audit_cycle_views.AuditCycleDashboardView.as_view(), name='audit_cycle_dashboard_view'),

    url(r'audit/(?P<audit_id>[0-9]+)$', audit_views.AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit$', audit_views.AuditView.as_view(), name='audit_view'),

    url(r'quotation/industry$', quotation_views.QuotationIndustryView.as_view(), name='industry_quotation_view'),
    url(r'quotation/audit_category$', quotation_views.QuotationAuditCategoryView.as_view(), name='audit_category_quotation_view'),
    url(r'quotation/audit_type$', quotation_views.QuotationAuditTypeView.as_view(), name='audit_type_quotation_view'),
    url(r'quotation/preview$', quotation_views.QuotationPreviewView.as_view(), name='quotation_preview_view'),
    url(r'quotation/(?P<quotation_id>[0-9]+)$', quotation_views.QuotationIdView.as_view(), name='quotation_id_view'),
    url(r'client/(?P<client_id>[0-9]+)/quotation$', quotation_views.QuotationView.as_view(), name='quotation_view'),

    url(r'questionnaire_type/(?P<questionnaire_type_id>[0-9]+)/questionnaire$', questionnaire_views.QuestionnaireByQuestionnaireTypeView.as_view(), name='questionnaire_view'),
    url(r'problem_statement/(?P<problem_statement_id>[0-9]+)/questionnaire_type$', questionnaire_views.QuestionnaireTypeByProblemStatementView.as_view(), name='questionnaire_type_view'),
    url(r'industry/(?P<industry_id>[0-9]+)/problem_statement$', questionnaire_views.ProblemStatementByIndustryView.as_view(), name='problem_statement_view'),
    url(r'industry$', questionnaire_views.IndustryView.as_view(), name='industry_view'),

    url(r'questionnaire_type/(?P<questionnaire_type_id>[0-9]+)$', questionnaire_type_views.QuestionnaireTypeIdView.as_view(), name='questionnaire_type_id_view'),
    url(r'questionnaire_type$', questionnaire_type_views.QuestionnaireTypeByClientView.as_view(), name='questionnaire_types_by_client_view'),

    url(r'store/(?P<store_id>[0-9]+)/client_user$', client_user_views.ClientUserByStoreIdView.as_view(), name='client_user_by_store_id_view'),
    url(r'store/(?P<store_id>[0-9]+)$', store_views.StoreIdView.as_view(), name='store_id_view'),
    url(r'store/import$', store_views.ImportStoreView.as_view(), name='import_store_view'),
    url(r'store/import/sample$', store_views.StoreSampleXlsxView.as_view(), name='sample_import_store_view'),
    url(r'store$', store_views.StoreView.as_view(), name='store_view'),

    url(r'client/(?P<client_id>[0-9]+)/payment_resp$', payment_views.PaymentResponseView.as_view(), name='payment_response_view'),
    url(r'client/(?P<client_id>[0-9]+)/payment$', payment_views.PaymentView.as_view(), name='payment_view'),
    url(r'client/payment_failed$', payment_views.PaymentFailedView.as_view(), name='payment_failed_view'),
    # url(r'client/account_balance$', payment_views.AccountBalancView.as_view(), name='account_balance_view'),

    url(r'payment/(?P<client_id>[0-9]+)/(?P<payment_id>[0-9]+)/invoice$', payment_views.PaymentInvoiceView.as_view(), name="payment_invoice_view"),

    url(r'client/(?P<client_id>[0-9]+)/bank_info$', client_views.ClientBankInfoView.as_view(), name='client_bank_info_view'),
    url(r'client/(?P<client_id>[0-9]+)$', client_views.ClientIdView.as_view(), name='client_id_view'),
    url(r'client$', client_views.ClientView.as_view(), name='client_view'),

    url(r'client_user/(?P<client_user_id>[0-9]+)/assign_stores$', client_user_views.ClientUserAssignStoresView.as_view(), name='client_user_assign_stores_view'),
    url(r'client_user/(?P<client_user_id>[0-9]+)$', client_user_views.ClientUserIdView.as_view(), name='client_user_id_view'),
    url(r'client_user$', client_user_views.ClientUserView.as_view(), name='client_user_view'),

], 'client_rest_v1')