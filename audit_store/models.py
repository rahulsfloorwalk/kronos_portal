import logging

from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericRelation
from django.conf import settings
from django.db.models import QuerySet
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, DateTimeField, IntegerField
from django.db.models import PROTECT
from django.db.transaction import atomic
from django.db.models import Q

from kronos.utils import get_color_code_by_percentage
from kronos.exceptions import AppLogicError

from guardian.shortcuts import get_users_with_perms, get_objects_for_user

from client.models import Store
from audit.models import Audit, AuditCycle
from answer.models import Answer
from questionnaire.models import Question
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR

from audit_store.signals import audit_store_status_change

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
                stores = get_objects_for_user(user, 'client.clientuser_store_visible', klass=Store)
                return self & (get_objects_for_user(user, 'audit_store.clientuser_visible') | AuditStore.objects.filter(audit__store__in=stores))
        else:
            raise TypeError("user needs to be of type: django.contrib.auth.models.User")

    def for_moderator(self, user):
        query_set = self.filter(audit__audit_cycle__status__in=(AuditCycle.ACTIVE, AuditCycle.REPORT))
        return get_objects_for_user(user, 'moderator_manage', klass=query_set)

    def assign_audit_store(self, audit, audit_date, auditor, by):
        audit_store = AuditStore()
        audit_store.audit = audit
        audit_store.audit_date = audit_date
        audit_store.user = auditor
        audit_store.status = AuditStore.ASSIGNED
        audit_store.save()
        audit_store_status_change.send(
            sender=self.__class__,
            status=AuditStore.ASSIGNED,
            old_status=None,
            user_actor=by,
            audit_store=audit_store
        )
        return audit_store

class AuditStore(Model):

    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    ACKNOWLEDGED = 'ACKNOWLEDGED'
    SUBMITTED = 'SUBMITTED'
    PM_REVIEW = 'PM_REVIEW'
    WITHDRAWN = 'WITHDRAWN'
    COMPLETED = 'COMPLETED'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'

    STATUS = (
        (ASSIGNED, "Assigned"),
        (FAILED, "Failed"),
        (ACKNOWLEDGED, "Acknowledged"),
        (SUBMITTED, "Submitted"),
        (PM_REVIEW, "PM Review"),
        (COMPLETED, "Completed"),
        (WITHDRAWN, "Withdrawn"),
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
    )
    _ALL_STATUSES = [s[0] for s in STATUS]
    _WITHDRAWABLE_STATUSES = (ASSIGNED, ACKNOWLEDGED, SUBMITTED, PM_REVIEW)
    _FAILABLE_STATUSES = (ASSIGNED, ACKNOWLEDGED, SUBMITTED, PM_REVIEW)
    _MANAGER_EDITABLE_STATUSES = (SUBMITTED, PM_REVIEW,)
    _MODERATOR_EDITABLE_STATUSES = (SUBMITTED,)
    _AUDITOR_EDITABLE_STATUSES = (ACKNOWLEDGED,)

    BAD = 0
    AVERAGE = 1
    GOOD = 2

    QA_RATING = (
        (BAD, "Bad"),
        (AVERAGE, "Average"),
        (GOOD, "Good"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    qa_rating = IntegerField(db_column='qa_rating', choices=QA_RATING, null=True)

    audit = ForeignKey(Audit, db_column='audit_id', related_name='audit_stores', on_delete=PROTECT)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    attachments = GenericRelation('attachment.Attachment', related_query_name='audit_stores')

    objects = AuditStoreQuerySet.as_manager()

    class Meta:
        permissions = (
            ('clientuser_visible', 'ClientUser can view this AuditStore instance'),
            ('moderator_manage', 'Moderator can manage this AuditStore instance'),
        )

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(AuditStore, self).save(*args, **kwargs)

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
            return int(self.marks_obtained() * 100 / max_marks)

    def color(self):
        return get_color_code_by_percentage(self.percentage())

    def is_withdrawable(self):
        return self.status in self._WITHDRAWABLE_STATUSES

    def is_failable(self):
        return self.status in self._FAILABLE_STATUSES

    def is_editable_by_auditor(self):
        return self.status in self._AUDITOR_EDITABLE_STATUSES

    def is_editable_by_moderator(self):
        return self.status in self._MODERATOR_EDITABLE_STATUSES

    def is_editable_by_manager(self):
        return self.status in self._MANAGER_EDITABLE_STATUSES

    def is_submittable(self):

        if self.status != AuditStore.ACKNOWLEDGED:
            _logger.debug("Report not acknowledged")
            return False

        sections = self.audit.audit_cycle.sections.all()
        report_sections = self.report_sections.all()

        if len(sections) != len(report_sections):
            _logger.debug("Report not submittable, section length does not match report section length")
            return False

        for report_section in report_sections:
            if not report_section.not_applicable:
                if report_section.auditor_comment in (None, ''):
                    _logger.debug("Report not submittable, some auditor comment is incomplete")
                    return False

                questions = Question.objects.filter(section_id=report_section.section_id).all()
                answers = Answer.objects.filter(
                    audit_store__id=self.id,
                    question__section_id=report_section.section_id
                ).all()

                if len(questions) != len(answers):
                    _logger.debug("Report not submittable, question length does not match answer length")
                    return False

                for answer in answers:
                    if not answer.not_applicable and answer.answer_text in (None, ''):
                        _logger.debug("Report not submittable, some answer is incomplete")
                        return False
            return True

    def is_completable(self):
        sections = self.audit.audit_cycle.sections.all()
        report_sections = self.report_sections.all()

        if len(sections) != len(report_sections):
            _logger.debug("report not completable, section length does not match report section length")
            return False

        for report_section in report_sections:
            if not report_section.not_applicable:
                if report_section.auditor_comment in (None, ''):
                    _logger.debug("report not completable, some auditor comment is incomplete")
                    return False
                if report_section.pm_comment in (None, ''):
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
                    if not answer.not_applicable and (answer.answer_text in (None, '') or answer.marks_obtained is None):
                            _logger.debug("report not completable, some answer is incomplete")
                            return False

        return True

    def is_qa_rated(self):
        return self.qa_rating is not None

    def is_presentable(self):
        if self.status in (self.COMPLETED, self.ACCEPTED):
            return True
        else:
            _logger.debug("report is neither in completed not in accepted state")
            return False

    def visible_to(self):
        users_with_perms = get_users_with_perms(self, attach_perms=True)
        return [user for user, perms in users_with_perms.items() if "clientuser_visible" in perms]

    def assigned_to_moderator(self):
        users_with_perms = get_users_with_perms(self, attach_perms=True)
        return [user for user, perms in users_with_perms.items() if "moderator_manage" in perms]

    def __str__(self):
        return "AuditStore({}): audit: {}".format(self.id, self.audit)


    @atomic
    def withdraw(self, *args, by):
        if not self.is_withdrawable():
            raise AppLogicError("Report cannot be withdrawn now")
        self._change_status(AuditStore.WITHDRAWN, by)

    @atomic
    def acknowledge(self, *args, by):
        if by is not self.user:
            raise AppLogicError("Report cannot be acknowledged by user")
        if self.status == AuditStore.ASSIGNED:
            self._change_status(AuditStore.ACKNOWLEDGED, by)

        else:
            raise AppLogicError("Report cannot be acknowledged now")

    @atomic
    def submit(self, *args, by):
        if by is not self.user:
            raise AppLogicError("Report cannot be submitted by user")
        if self.is_submittable():
            self._change_status(AuditStore.SUBMITTED, by)

        else:
            raise AppLogicError("Report cannot be acknowledged now")

    @atomic
    def submit_manager(self, *args, by):
        if not by.groups.filter(Q(name=GROUP_NAME_MANAGER) | Q(name=GROUP_NAME_MODERATOR)).exists():
            raise AppLogicError("Report cannot be submitted by user")

        if self.status == AuditStore.ACKNOWLEDGED:
            self._change_status(AuditStore.SUBMITTED, by)

        else:
            raise AppLogicError("Report cannot be submitted now")

    @atomic
    def revert_submit(self, *args, by):
        if not by.groups.filter(Q(name=GROUP_NAME_MANAGER) | Q(name=GROUP_NAME_MODERATOR)).exists():
            raise AppLogicError("Report cannot be unsubmitted by user")

        if self.status == AuditStore.SUBMITTED:
            self._change_status(AuditStore.ACKNOWLEDGED, by)

        else:
            raise AppLogicError("Report cannot be unsubmitted now")

    @atomic
    def qa_ok(self, *args, by):
        if not self.is_completable():
            raise AppLogicError("Report is not complete.")

        if not self.is_qa_rated():
            raise AppLogicError("Please rate report before forwarding for PM Review.")

        if self.status == AuditStore.SUBMITTED:
            self._change_status(AuditStore.PM_REVIEW, by)

        else:
            raise AppLogicError("Report cannot be forwarded for PM Review now.")

    @atomic
    def pm_revert(self, *args, by):
        if self.status == AuditStore.PM_REVIEW:
            self._change_status(AuditStore.SUBMITTED, by)

        else:
            raise AppLogicError("Report cannot be reverted to QA now.")

    @atomic
    def complete(self, *args, by):
        if not by.groups.filter(name=GROUP_NAME_MANAGER).exists():
            raise AppLogicError("Report cannot be completed by user")

        if not self.is_completable():
            raise AppLogicError("Report is not complete")

        if not self.is_qa_rated():
            raise AppLogicError("Report is not rated")

        if self.status == AuditStore.PM_REVIEW:
            self._change_status(AuditStore.COMPLETED, by)

        else:
            raise AppLogicError("Report cannot be completed now")

    @atomic
    def revert_complete(self, *args, by):
        if not by.groups.filter(name=GROUP_NAME_MANAGER).exists():
            raise AppLogicError("Report cannot be reverted to pm review by user")

        if self.status == AuditStore.COMPLETED:
            self._change_status(AuditStore.PM_REVIEW, by)

        else:
            raise AppLogicError("Report cannot be reverted to pm review now")

    @atomic
    def accept(self, *args, by):
        if not by.groups.filter(name=GROUP_NAME_MANAGER).exists():
            raise AppLogicError("Report cannot be accepted by user")

        if self.status == AuditStore.COMPLETED:
            self._change_status(AuditStore.ACCEPTED, by)

        else:
            raise AppLogicError("Report cannot be accepted now")

    @atomic
    def reject(self, *args, by):
        if not by.groups.filter(name=GROUP_NAME_MANAGER).exists():
            raise AppLogicError("Report cannot be rejected by user")

        if self.status == AuditStore.COMPLETED:
            self.qa_rating = AuditStore.BAD
            self.save()
            self._change_status(AuditStore.REJECTED, by)
        else:
            raise AppLogicError("Report cannot be rejected now")

    @atomic
    def fail(self, *args, by):
        if not by.groups.filter(name=GROUP_NAME_MANAGER).exists():
            raise AppLogicError("Report cannot be failed by user")

        if self.is_failable():
            old_status = self.status
            self.qa_rating = AuditStore.BAD
            self.save()
            self._change_status(AuditStore.FAILED, by)

        else:
            raise AppLogicError("Report cannot be failed now")

    @atomic
    def rate(self, rating):
        if self.status not in (AuditStore.SUBMITTED, AuditStore.PM_REVIEW):
            raise AppLogicError("Report cannot be rated now")

        if rating not in (AuditStore.BAD, AuditStore.AVERAGE, AuditStore.GOOD):
            raise AppLogicError("Invalid Rating")

        self.qa_rating = rating
        self.save()

    def _change_status(self, new_status, user_actor):
        audit_store_status_change.send(
            sender=self.__class__,
            status=new_status,
            old_status=self.status,
            user_actor=user_actor,
            audit_store=self
        )
        self.status = new_status
        self.save()


class ReportStatusLog(Model):
    id = AutoField(db_column='id', primary_key=True)
    user_actor = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_actor_id', on_delete=PROTECT)
    audit_store = ForeignKey(AuditStore, db_column='audit_store_id', on_delete=PROTECT)
    status = CharField(db_column='status', max_length=20, choices=AuditStore.STATUS, blank=False)
    created_at = DateTimeField(db_column="created_at")
