from django.conf.urls import url
from .views import AuditCycleView, AuditCycleIdView, AuditStoreByAuditCycle, AuditStoreIdView
from .views import AuditStoreIdAuditDateView, AuditStoreIdQAOKView, AuditStoreIdFailView, AuditStoreIdSubmitView, AuditStoreIdUnSubmitView, AuditStoreIdQARatingView
from .views import AuditStoreAttachmentView, ReportSectionAttachmentView, AttachmentIdView, AttachmentIdRenameView, AttachmentIdCompleteView, MoveAttachmentToSection,AuditStoreMandatoryProofTagView
from .views import AuditStorePendingView, AuditStoreCompletedView
from .views import SectionView, ReportSectionView, AnswerView
from .views import PMCommentView, AuditorCommentView, AnswerTextView, MarksObtainedView, NotApplicableView, AnswerNotApplicableView, AnswerCommentView, AnswerRevertMessageView, SectionRevertMessageView
from .views import AuditStoreIdReimbursementView, AuditStoreIdEarningsPerAuditView, AuditStoreIdReportSummaryView
from .views import AuditStoreIdModeratorStatusView, AuditStoreIdModeratorCommentView, AuditStoreIdCheckPoints
from .views import AttachmentProofTagList, AttachmentIdProofTagView,AuditGuidelinesByAuditStore
from .views import AttachmentIdRotateView,StoreViewByClientView,AuditIdView
from .views import AuditStoreIdArrangeAttachment,AuditStoreProofTagNotAvailableView,ReportSubmissionTimeView
from .views import ClientView
from .views import ConfigView
from .views import AuditorRatingView

urlpatterns = ([
    url(r'attachment/(?P<attachment_id>[0-9]+)/complete$', AttachmentIdCompleteView.as_view(), name='attachment_id_complete_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)/rename$', AttachmentIdRenameView.as_view(), name='attachment_id_rename_view'),
    url(r'attachment/(?P<attachment_id>[0-9]+)$', AttachmentIdView.as_view(), name='attachment_id_view'),

    url(r'attachment/(?P<attachment_id>[0-9]+)/proof_tag$', AttachmentIdProofTagView.as_view(), name='attachment_id_proof_tag_view'),

    url(r'attachment/(?P<audit_store_id>[0-9]+)/movetosection_moderator$', MoveAttachmentToSection.as_view(), name='move_attachment_to_section'),

    url(r'attachment/(?P<attachment_id>[0-9]+)/rotate$', AttachmentIdRotateView.as_view(), name='attachment_id_rotate_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/not_applicable$', NotApplicableView.as_view(), name='not_applicable_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/auditor_comment$', AuditorCommentView.as_view(), name='auditor_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/section_revert_message$', SectionRevertMessageView.as_view(), name='section_revert_message_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/pm_comment$', PMCommentView.as_view(), name='pm_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section/(?P<section_id>[0-9]+)/attachment$', ReportSectionAttachmentView.as_view(), name='report_section_attachment_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/marks_obtained$', MarksObtainedView.as_view(), name='marks_obtained_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_text$', AnswerTextView.as_view(), name='answer_text_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_comment$', AnswerCommentView.as_view(), name='answer_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/answer_revert_message$', AnswerRevertMessageView.as_view(), name='answer_revert_message_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/question/(?P<question_id>[0-9]+)/not_applicable$', AnswerNotApplicableView.as_view(), name='answer_not_applicable_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/section$', SectionView.as_view(), name='section_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_section$', ReportSectionView.as_view(), name='report_section_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/answer$', AnswerView.as_view(), name='answer_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/attachment$', AuditStoreAttachmentView.as_view(), name='audit_store_attachment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/report_summary$', AuditStoreIdReportSummaryView.as_view(), name='audit_store_id_report_summary_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/mandatory_proof_tag$', AuditStoreMandatoryProofTagView.as_view(), name='audit_store_mandatory_proof_tag_view'),

    url(r'audit_store/(?P<audit_store_id>[0-9]+)/guildlines$', AuditGuidelinesByAuditStore.as_view(), name='audit_guidelines_by_audit_store'),
    url(r'audit_store/report_submission_time$', ReportSubmissionTimeView.as_view(), name="audit_store_id_report_submission_time_view"),


    url(r'audit_store/(?P<audit_store_id>[0-9]+)/audit_date$', AuditStoreIdAuditDateView.as_view(), name='audit_store_id_audit_date_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator_status$', AuditStoreIdModeratorStatusView.as_view(), name='audit_store_id_moderator_status_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/moderator_comment$', AuditStoreIdModeratorCommentView.as_view(), name='audit_store_id_moderator_comment_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/earnings_per_audit$', AuditStoreIdEarningsPerAuditView.as_view(), name='audit_store_id_earnings_per_audit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/reimbursement$', AuditStoreIdReimbursementView.as_view(), name='audit_store_id_reimbursement_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/qa_rating$', AuditStoreIdQARatingView.as_view(), name='audit_store_id_qa_rating_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/auditor_rating$', AuditorRatingView.as_view(), name='audit_store_id_auditor_rating_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/submit$', AuditStoreIdSubmitView.as_view(), name='audit_store_id_submit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/unsubmit$', AuditStoreIdUnSubmitView.as_view(), name='audit_store_id_unsubmit_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/fail$', AuditStoreIdFailView.as_view(), name='audit_store_id_fail_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/qa_ok$', AuditStoreIdQAOKView.as_view(), name='audit_store_id_qa_ok_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/check_points$', AuditStoreIdCheckPoints.as_view(), name='audit_store_id_check_points'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/arrange_attachment$', AuditStoreIdArrangeAttachment.as_view(), name='audit_store_id_arrange_attachment'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)$', AuditStoreIdView.as_view(), name='audit_store_id_view'),
    url(r'audit_store/pending$', AuditStorePendingView.as_view(), name='audit_store_pending_view'),
    url(r'audit_store/completed$', AuditStoreCompletedView.as_view(), name='audit_store_completed_view'),
    url(r'client/(?P<client_id>[0-9]+)/store$', StoreViewByClientView.as_view(), name='audit_store_id_view'),
    url(r'audit$', AuditIdView.as_view(), name='audit_id_view'),
    url(r'audit_store/(?P<audit_store_id>[0-9]+)/proof_not_available$', AuditStoreProofTagNotAvailableView.as_view(), name="audit_store_upload_proof_tag_not_available_view"),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/audit_store$', AuditStoreByAuditCycle.as_view(), name='audit_store_by_audit_cycle'),
    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)$', AuditCycleIdView.as_view(), name='audit_cycle_id_view'),
    url(r'audit_cycle$', AuditCycleView.as_view(), name='audit_cycle_view'),

    url(r'audit_cycle/(?P<audit_cycle_id>[0-9]+)/attachment_proof_tag_list$', AttachmentProofTagList.as_view(), name='attachment_proof_tag_list'),
    url(r'client$', ClientView.as_view(), name='client_view'),

    url(r'config$', ConfigView.as_view(), name='config_view'),
], 'moderator')
