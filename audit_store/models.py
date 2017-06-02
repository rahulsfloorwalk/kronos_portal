import logging

from django.contrib.contenttypes.fields import GenericRelation
from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, OneToOneField
from django.db.models import CASCADE

from audit.models import Audit
from answer.models import Answer
from questionnaire.models import Question

_logger = logging.getLogger(__name__)

class AuditStore(Model):

    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    SUBMITTED = 'SUBMITTED'
    WITHDRAWN = 'WITHDRAWN'
    COMPLETED = 'COMPLETED'

    STATUS = (
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (SUBMITTED, "Submitted"),
            (COMPLETED, "Completed"),
            (WITHDRAWN, "Withdrawn"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey(Audit, db_column='audit_id', related_name='audit_stores')
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id')

    attachments = GenericRelation('attachment.Attachment', related_query_name='audit_stores')

    def marks_obtained(self):
        return sum(rs.marks_obtained() for rs in self.report_sections.all())

    def max_marks(self):
        '''may return zero so make sure you check for DivideByZero before using this blindly in the denominator'''
        return sum(rs.max_marks() for rs in self.report_sections.all())

    def percentage(self):
        max_marks = self.max_marks()
        if max_marks is 0:
            return max_marks
        else:
            return int(self.marks_obtained() * 100 / max_marks )

    def is_completable(self):
        sections = self.audit.audit_cycle.sections.all()
        report_sections = self.report_sections.all()

        if len(sections) != len(report_sections):
            _logger.debug("report not completable, section length does not match report section length")
            return False

        for report_section in report_sections:
            if not report_section.not_applicable:
                if report_section.auditor_comment in ( None ,''):
                    _logger.debug("report not completable, some auditor comment is incomplete")
                    return False
                if report_section.pm_comment in ( None ,''):
                    _logger.debug("report not completable, some PM comment is incomplete")
                    return False

                questions = Question.objects.filter(section_id=report_section.section_id).all()
                answers = Answer.objects.filter(
                        audit_store__id=self.id,
                        question__section_id=report_section.section_id
                    ).all()

                if len(questions) != len(answers):
                    _logger.debug("report not completable, question length does not match answer length")
                    return False

                for answer in answers:
                    if not answer.not_applicable and (answer.answer_text in ( None ,'') or answer.marks_obtained is None):
                            _logger.debug("report not completable, some answer is incomplete")
                            return False

        return True
