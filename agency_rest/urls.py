from django.conf.urls import url
from . import views

urlpatterns = ([
    url(r'agency$', views.AgencyView.as_view(), name='agency_view'),
    url(r'user$', views.UserView.as_view(), name='user_view'),
    url(r'presence/city/(?P<city_id>[0-9]+)/present$', views.AgencyPresencePresentView.as_view(), name='agency_presence_present_view'),
    url(r'presence/state/(?P<state_code>[\w\-]+)$', views.AgencyPresenceByStateView.as_view(), name='agency_presence_by_state_view'),
    url(r'states/(?P<state_code>[\w\-]+)/city$', views.CityView.as_view(), name='city_view'),
    url(r'states$', views.StateView.as_view(), name='state_view'),
    url(r'config$', views.ConfigView.as_view(), name='config_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', views.SectionView.as_view(), name="section_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', views.ReportSectionListView.as_view(), name="report_section_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerListView.as_view(), name="answer_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer$', views.AnswerSubmitView.as_view(), name='answer_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_comment$', views.AnswerCommentView.as_view(), name='answer_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', views.AuditStoreAttachmentView.as_view(), name="audit_store_attachment_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', views.ReportSectionAttachmentView.as_view(), name="report_section_attachment_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/acknowledge$', views.AuditStoreIdAcknowledgeView.as_view(), name="audit_store_id_acknowledge_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', views.AuditStoreIdSubmitView.as_view(), name="audit_store_id_submit_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/comment$', views.CommentSubmitView.as_view(), name="comment_submit_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', views.AuditStoreIdView.as_view(), name="audit_store_id_view"),
    url(r'audit_store$', views.AuditStoreListView.as_view(), name="audit_store_list_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', views.AttachmentCompleteView.as_view(), name="attachment_complete_view"),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', views.AttachmentIdView.as_view(), name="attachment_id_view"),
], 'agency_rest')
