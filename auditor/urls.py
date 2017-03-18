from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'notifications$', views.NotificationsView.as_view(), name='notifications_view'),
    url(r'state$', views.StateView.as_view(), name='state_view'),
    url(r'city/(?P<state>[\w\-]+)$', views.CityView.as_view(), name='city_view'),

    url(r'profile_info$', views.ProfileInfoView.as_view(), name="profile_info_view"),
    url(r'additional_info$', views.AdditionalInfoView.as_view(), name="additional_info_view"),
    url(r'bank_info$', views.BankInfoView.as_view(), name="bank_info_view"),

    url(r'application$', views.AuditApplicationsView.as_view(), name="audit_applications_view"),
    url(r'audit$', views.AvailableAuditsView.as_view(), name="available_audits"),
    url(r'audit/(?P<audit_id>[0-9]+)/application/cancel$', views.AuditApplicationCancelView.as_view(), name="audit_application_cancel_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/application/apply$', views.AuditApplicationApplyView.as_view(), name="audit_application_apply_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/application$', views.AuditApplicationView.as_view(), name="audit_application_view"),
    url(r'audit/(?P<audit_id>[0-9]+)/applications$', views.AuditApplicationsView.as_view(), name="audit_applications_view"),
    url(r'audit/(?P<audit_id>[0-9]+)$', views.AuditView.as_view(), name="audit_view"),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionView.as_view(), name="section_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreView.as_view(), name="audit_store_view"),
    url(r'audit_store$', views.AuditStoresView.as_view(), name="audit_stores_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerListView.as_view(), name="answer_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionListView.as_view(), name="report_section_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', views.AuditStoreIdSubmitView.as_view(), name="audit_store_id_submit_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AuditStoreAttachmentView.as_view(), name="audit_store_upload_view"),

    url(r'question/(?P<question_id>[0-9]+)/answer$', views.AnswerSubmitView.as_view(), name="answer_submit_view"),
    url(r'section/(?P<section_id>[0-9]+)/comment$', views.CommentSubmitView.as_view(), name="comment_submit_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', views.AttachmentCompleteView.as_view(), name="attachment_complete_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', views.AttachmentIdView.as_view(), name="attachment_id_view"),
], 'auditor')
