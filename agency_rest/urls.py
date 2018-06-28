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
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerListView.as_view(), name="agency_answer_list_view"),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question_id/(?P<audit_store_id>[0-9]+)/answer$', views.AnswerSubmitView.as_view(), name='agency_answer_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question_id/(?P<audit_store_id>[0-9]+)/answer_comment$', views.AnswerCommentView.as_view(), name='agency_answer_comment_view'),
], 'agency_rest')
