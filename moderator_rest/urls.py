from django.conf.urls import url
from . import views
from .views import AuditCycleView, AuditCycleIdView, AuditStoreByAuditCycle, AuditStoreIdView
from .views import AuditStoreIdAuditDateView, AuditStoreIdCompleteView, AuditStoreIdFailView, AuditStoreIdSubmitView, AuditStoreIdUnSubmitView
from .views import AuditStoreAttachmentView, ReportSectionAttachmentView, AttachmentIdView, AttachmentIdRenameView, AttachmentIdCompleteView
from .views import SectionView, ReportSectionView, AnswerView
from .views import PMCommentView, AuditorCommentView, AnswerTextView, MarksObtainedView, NotApplicableView, AnswerNotApplicableView, AnswerCommentView

urlpatterns = ([
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', AttachmentIdCompleteView.as_view(), name='attachment_id_complete_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/rename$', AttachmentIdRenameView.as_view(), name='attachment_id_rename_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', AttachmentIdView.as_view(), name='attachment_id_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/not_applicable$', NotApplicableView.as_view(), name='not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/auditor_comment$', AuditorCommentView.as_view(), name='auditor_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/pm_comment$', PMCommentView.as_view(), name='pm_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', ReportSectionAttachmentView.as_view(), name='report_section_attachment_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/marks_obtained$', MarksObtainedView.as_view(), name='marks_obtained_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_text$', AnswerTextView.as_view(), name='answer_text_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_comment$', AnswerCommentView.as_view(), name='answer_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/not_applicable$', AnswerNotApplicableView.as_view(), name='answer_not_applicable_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', SectionView.as_view(), name='section_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', ReportSectionView.as_view(), name='report_section_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', AnswerView.as_view(), name='answer_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', AuditStoreAttachmentView.as_view(), name='audit_store_attachment_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/audit_date$', AuditStoreIdAuditDateView.as_view(), name='audit_store_id_audit_date_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', AuditStoreIdSubmitView.as_view(), name='audit_store_id_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/complete$', AuditStoreIdCompleteView.as_view(), name='audit_store_id_complete_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', AuditStoreIdView.as_view(), name='audit_store_id_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', AuditCycleView.as_view(), name='audit_cycle_view'),
], 'manager')
