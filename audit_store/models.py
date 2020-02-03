import logging

from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericRelation
from django.conf import settings
from django.db.models import QuerySet, Q
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, DateTimeField, IntegerField
from django.db.models import PROTECT
from django.db.transaction import atomic

from kronos.utils import get_color_code_by_percentage
from kronos.exceptions import AppLogicError

from guardian.shortcuts import get_users_with_perms, get_objects_for_user

from client.models import Store
from audit.models import Audit, AuditCycle
from answer.models import Answer
from questionnaire.models import Question

from audit_store.signals import audit_store_status_change
from django.contrib.postgres.fields import JSONField

from answer.models import ReportSection
from attachment.models import Attachment
from django.contrib.contenttypes.models import ContentType

_logger = logging.getLogger(__name__)

def find_content_id_by_object_name(app_label,model):
    content_obj = ContentType.objects.get(app_label=app_label, model=model)
    return content_obj.id


class AuditStoreQuerySet(QuerySet):
    def presentable(self):
        presentable_status = (AuditStore.COMPLETED, AuditStore.ACCEPTED)
        presentable_audit_cycle_status = (AuditCycle.ACTIVE, AuditCycle.REPORT, AuditCycle.CLEARING, AuditCycle.ARCHIVED)
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
        query_set = self.filter(audit__audit_cycle__status__in=AuditCycle.MODERATOR_MODIFIABLE_STATUSES)
        return get_objects_for_user(user, 'moderator_manage', klass=query_set)

    def assign_audit_store(self, audit, audit_date, auditor, reimbursement, earnings_per_audit, checkpoints, by):
        audit_store = AuditStore()
        audit_store.audit = audit
        audit_store.audit_date = audit_date
        audit_store.user = auditor
        audit_store.status = AuditStore.ASSIGNED
        audit_store.reimbursement = reimbursement
        audit_store.earnings_per_audit = earnings_per_audit
        audit_store.check_points = checkpoints
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
    _MANAGER_EDITABLE_STATUSES = (ASSIGNED, ACKNOWLEDGED, SUBMITTED, PM_REVIEW)
    _MODERATOR_EDITABLE_STATUSES = (SUBMITTED,)
    _AUDITOR_EDITABLE_STATUSES = (ACKNOWLEDGED,)
    _AGENCY_EDITABLE_STATUSES = (ACKNOWLEDGED,)

    AGENCY_VISIBILITY_STATUSES = (ASSIGNED, ACKNOWLEDGED, SUBMITTED, PM_REVIEW, COMPLETED, ACCEPTED, FAILED, REJECTED)

    BAD = 0
    AVERAGE = 1
    GOOD = 2

    QA_RATING = (
        (BAD, "Bad"),
        (AVERAGE, "Average"),
        (GOOD, "Good"),
    )

    MISS_IMAGE = "MISS_IMAGE"
    MISS_AUDIO = "MISS_AUDIO"
    MISS_VIDEO = "MISS_VIDEO"
    AUDITOR_NOT_RESPONDING = "AUDITOR_NOT_RESPONDING"
    CONTRADICTION = "CONTRADICTION"
    NOT_SUFFICIENT_PROOFS = "NOT_SUFFICIENT_PROOFS"
    DATE_TIME_MISSING = "DATE_TIME_MISSING"
    WAITING_FOR_ATTACHMENT = "WAITING_FOR_ATTACHMENT"
    FAULTY_REPORT = "FAULTY_REPORT"

    MODERATOR_STATUS = (
        (MISS_IMAGE, "Missing Image"),
        (MISS_AUDIO, "Missing Audio"),
        (MISS_AUDIO, "Missing Video"),
        (AUDITOR_NOT_RESPONDING, "Auditor Not Responding"),
        (CONTRADICTION, "Contradiction"),
        (NOT_SUFFICIENT_PROOFS, "Not Sufficient Proofs"),
        (DATE_TIME_MISSING, "Date or Time Missing in Image"),
        (WAITING_FOR_ATTACHMENT, "Waiting for Attachment from Auditor"),
        (FAULTY_REPORT, "Faulty Report"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    qa_rating = IntegerField(db_column='qa_rating', choices=QA_RATING, null=True)

    audit = ForeignKey(Audit, db_column='audit_id', related_name='audit_stores', on_delete=PROTECT)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    earnings_per_audit = IntegerField(db_column='earnings_per_audit', null=True)
    reimbursement = IntegerField(db_column='reimbursement', null=True)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    attachments = GenericRelation('attachment.Attachment', related_query_name='audit_stores')

    attribute_data = JSONField(db_column='attribute_data', default=dict, blank=False)

    moderator_status = CharField(db_column='moderator_status', max_length=100, choices=MODERATOR_STATUS, blank=True)
    moderator_comment = CharField(db_column='moderator_comment', max_length=3000, blank=True)

    report_summary = CharField(db_column='report_summary', max_length=16384, blank=True)
    report_summary_original = CharField(db_column='report_summary_original', max_length=16384, blank=True)

    check_points = JSONField(db_column='check_points', default=dict, blank=False)

    audit_store_percentage = IntegerField(db_column='percentage', null=True, blank=True)

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

    def save_percentage(self):
        self.audit_store_percentage = int(self.percentage())
        self.save()

    def color(self):
        return get_color_code_by_percentage(self.percentage())

    def is_withdrawable(self):
        return self.status in self._WITHDRAWABLE_STATUSES

    def is_failable(self):
        return self.status in self._FAILABLE_STATUSES

    def is_editable_by_auditor(self):
        return self.status in self._AUDITOR_EDITABLE_STATUSES

    def is_editable_by_agency(self):
        return self.status in self._AGENCY_EDITABLE_STATUSES

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

                if not report_section.has_minimum_attachments():
                    _logger.debug("Report not submittable, not enough attachments uploaded")
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

    def check_auditor_comment_len(self):
        report_sections = self.report_sections.all()
        for report_section in report_sections:
            auditor_comment = report_section.auditor_comment
            if len(auditor_comment) < 30:
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

    def set_report_summary(self, report_summary):
        self.report_summary = report_summary
        self.save()

    def copy_report_summary(self):
        self.report_summary_original = self.report_summary
        self.save()

    def set_moderator_status(self, moderator_status):
        self.moderator_status = moderator_status
        self.save()

    def set_moderator_comment(self, moderator_comment):
        self.moderator_comment = moderator_comment
        self.save()

    def set_check_points(self, check_points):
        self.check_points = check_points
        self.save()

    @atomic
    def withdraw(self, *args, by):
        if not self.is_withdrawable():
            raise AppLogicError("Report cannot be withdrawn now")
        self._change_status(AuditStore.WITHDRAWN, by)

    @atomic
    def acknowledge(self, *args, by):
        if self.status != AuditStore.ASSIGNED:
            raise AppLogicError("Report cannot be acknowledged now")
        self._change_status(AuditStore.ACKNOWLEDGED, by)

    @atomic
    def submit(self, *args, by):
        if self.status != AuditStore.ACKNOWLEDGED:
            raise AppLogicError("Report cannot be submitted now")

        self._change_status(AuditStore.SUBMITTED, by)

    @atomic
    def submit_manager(self, *args, by):
        if self.status != AuditStore.ACKNOWLEDGED:
            raise AppLogicError("Report cannot be submitted now")

        self._change_status(AuditStore.SUBMITTED, by)

    @atomic
    def revert_submit(self, *args, by):

        if self.status != AuditStore.SUBMITTED:
            raise AppLogicError("Report cannot be unsubmitted now")

        self._change_status(AuditStore.ACKNOWLEDGED, by)

    @atomic
    def qa_ok(self, *args, by):
        if not self.is_completable():
            raise AppLogicError("Report is not complete.")

        if not self.is_qa_rated():
            raise AppLogicError("Please rate report before forwarding for PM Review.")

        if self.status != AuditStore.SUBMITTED:
            raise AppLogicError("Report cannot be forwarded for PM Review now.")

        self._change_status(AuditStore.PM_REVIEW, by)

    @atomic
    def pm_revert(self, *args, by):
        if self.status != AuditStore.PM_REVIEW:
            raise AppLogicError("Report cannot be reverted to QA now.")

        self._change_status(AuditStore.SUBMITTED, by)

    @atomic
    def complete(self, *args, by):

        if not self.is_completable():
            raise AppLogicError("Report is not complete")

        if not self.is_qa_rated():
            raise AppLogicError("Report is not rated")

        if self.status != AuditStore.PM_REVIEW:
            raise AppLogicError("Report cannot be completed now")

        self._change_status(AuditStore.COMPLETED, by)
        self.save_percentage()


    @atomic
    def revert_complete(self, *args, by):

        if self.status != AuditStore.COMPLETED:
            raise AppLogicError("Report cannot be reverted to pm review now")

        self._change_status(AuditStore.PM_REVIEW, by)

    @atomic
    def accept(self, *args, by):

        if self.status != AuditStore.COMPLETED:
            raise AppLogicError("Report cannot be accepted now")

        self._change_status(AuditStore.ACCEPTED, by)

    @atomic
    def reject(self, *args, by):

        if self.status != AuditStore.COMPLETED:
            raise AppLogicError("Report cannot be rejected now")

        self.qa_rating = AuditStore.BAD
        self.save()
        self._change_status(AuditStore.REJECTED, by)

    @atomic
    def fail(self, *args, by, message=""):

        if not self.is_failable():
            raise AppLogicError("Report cannot be failed now")

        self.qa_rating = AuditStore.BAD
        self.save()
        self._change_status(AuditStore.FAILED, by, message)

    @atomic
    def rate(self, rating):
        if self.status not in (AuditStore.SUBMITTED, AuditStore.PM_REVIEW):
            raise AppLogicError("Report cannot be rated now")

        if rating not in (AuditStore.BAD, AuditStore.AVERAGE, AuditStore.GOOD):
            raise AppLogicError("Invalid Rating")

        self.qa_rating = rating
        self.save()

    def _change_status(self, new_status, user_actor, message=""):
        audit_store_status_change.send(
            sender=self.__class__,
            status=new_status,
            old_status=self.status,
            user_actor=user_actor,
            message=message,
            audit_store=self
        )
        self.status = new_status
        self.save()

    @atomic
    def set_reimbursement(self, reimbursement):
        self.reimbursement = reimbursement
        self.save()

    @atomic
    def set_earnings_per_audit(self, earnings_per_audit):
        self.earnings_per_audit = earnings_per_audit
        self.save()

    @atomic
    def set_attribute_data(self, attribute_json_id, attribute_option_id):
        self.attribute_data[attribute_json_id] = attribute_option_id
        self.save()

    def find_faulty_report_count(self):
        audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
        report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")
        report_section_list = ReportSection.objects.filter(audit_store_id=self.id).values_list('id')
        attachment_obj = Attachment.objects.filter(
            Q(content_type_id=audit_store_content_type_id, object_id=self.id, mime_type__contains="image",
              status="ATTACHED") | Q(content_type_id=report_section_content_type_id,
                                     object_id__in=report_section_list, mime_type__contains="image",
                                     status="ATTACHED"))
        count = 0
        for i in attachment_obj:
            if i.attachment_id:
                count += 1
        return count

class ReportStatusLog(Model):
    id = AutoField(db_column='id', primary_key=True)
    user_actor = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_actor_id', on_delete=PROTECT)
    audit_store = ForeignKey(AuditStore, db_column='audit_store_id', on_delete=PROTECT)
    status = CharField(db_column='status', max_length=20, choices=AuditStore.STATUS, blank=False)
    message = CharField(db_column='message', max_length=4096, blank=True, null=True)
    created_at = DateTimeField(db_column="created_at")
