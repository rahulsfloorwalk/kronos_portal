import logging

from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericRelation
from django.conf import settings
from django.db.models import QuerySet
from django.db.models import Model, Manager, CharField, AutoField, DateField, ForeignKey, OneToOneField
from django.db.models import CASCADE

from guardian.shortcuts import get_users_with_perms, get_objects_for_user

from audit.models import Audit, AuditCycle
from answer.models import Answer
from questionnaire.models import Question

_logger = logging.getLogger(__name__)

class AuditStoreQuerySet(QuerySet):
    def presentable(self):
        presentable_status = (AuditStore.COMPLETED, AuditStore.ACCEPTED)
        presentable_audit_cycle_status = (AuditCycle.ACTIVE, AuditCycle.REPORT, AuditCycle.ARCHIVED)
        return self.filter(
                audit__audit_cycle__status__in=presentable_audit_cycle_status,
                status__in=presentable_status,
                )

    def visible_to(self, user):
        if isinstance(user, User):
            if user.has_perm('client.clientuser_admin'):
                return self
            else:
                return get_objects_for_user(user, 'clientuser_visible', klass=self)
        else:
            raise TypeError("user needs to be of type: django.contrib.auth.models.User")



class AuditStore(Model):

    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    SUBMITTED = 'SUBMITTED'
    WITHDRAWN = 'WITHDRAWN'
    COMPLETED = 'COMPLETED'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'

    STATUS = (
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (SUBMITTED, "Submitted"),
            (COMPLETED, "Completed"),
            (WITHDRAWN, "Withdrawn"),
            (ACCEPTED, "Accepted"),
            (REJECTED, "Rejected"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey(Audit, db_column='audit_id', related_name='audit_stores')
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id')

    attachments = GenericRelation('attachment.Attachment', related_query_name='audit_stores')

    objects = AuditStoreQuerySet.as_manager()

    class Meta:
        permissions = (
                ('clientuser_visible', 'ClientUser can view this AuditStore instance'),
            )

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

    def is_presentable(self):
        if self.status in (self.COMPLETED, self.ACCEPTED):
            return True
        else:
            _logger.debug("report is neither in completed not in accepted state")
            return False

    def visible_to(self):
        return get_users_with_perms(self)
