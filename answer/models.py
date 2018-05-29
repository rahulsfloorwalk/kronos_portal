from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from django.db.models import Model, CharField, IntegerField, AutoField, ForeignKey, BooleanField, DateTimeField
from django.db.models import PROTECT, F, Value, Sum
from django.db.models.functions import Coalesce

from kronos.utils import get_color_code
from kronos.exceptions import AppLogicError

from questionnaire.models import Question
from questionnaire.models import Section

class Answer(Model):

    id = AutoField(db_column = 'id', primary_key=True)

    question = ForeignKey(Question, related_name='answers', db_column='question_id', on_delete=PROTECT)
    audit_store = ForeignKey('audit_store.AuditStore', related_name='answers', db_column='audit_store_id', on_delete=PROTECT)

    answer_text = CharField(db_column='answer_text', max_length=2048, blank=True)
    answer_text_original = CharField(db_column='answer_text_original', max_length=2048, blank=True)
    marks_obtained = IntegerField(db_column='marks_obtained', blank=True, null=True)
    not_applicable = BooleanField(db_column='not_applicable', default=False, blank=False, null=False)
    answer_comment = CharField(db_column='answer_comment', max_length=2048, blank=True)
    attachments = GenericRelation('attachment.Attachment', related_query_name='answers')

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(Answer, self).save(*args, **kwargs)

    def set_not_applicable(self, not_applicable):
        self.not_applicable = not_applicable
        self.save()

    def set_answer_comment(self, answer_comment):
        if self.question.question_type == Question.MUTEX:
            self.answer_comment = answer_comment
            self.save()
        else:
            raise AppLogicError("Question type must be mutex")

    def set_answer_text(self, answer_text):
        if answer_text in (None, ""):
            raise AppLogicError("answer cannot be empty")

        if self.question.question_type == Question.MUTEX:
            result = [o for o in self.question.question_data["options"] if o["value"] == answer_text]
            if len(result) == 1:
                self.marks_obtained = result[0]["marks"]
                self.answer_text = answer_text
                self.save()
            else:
                raise AppLogicError("invalid answer")
        elif self.question.question_type == Question.PLAIN:
            self.answer_text = answer_text
            self.save()

    def set_marks_obtained(self, marks_obtained):
        if marks_obtained > self.question.max_marks:
            raise AppLogicError("Marks cannot be greater than {}".format(self.question.max_marks))
        if marks_obtained < 0:
            raise AppLogicError("Marks cannot be less than 0")

        self.marks_obtained = marks_obtained
        self.save()

    class Meta:
        unique_together = (('question', 'audit_store',))

class ReportSection(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    audit_store = ForeignKey('audit_store.AuditStore', related_name='report_sections', db_column='audit_store_id', blank=False, on_delete=PROTECT)
    section = ForeignKey(Section, db_column='section_id', related_name='report_sections', blank=False, on_delete=PROTECT)
    pm_comment = CharField(db_column='pm_comment', max_length=2048, blank=True)
    auditor_comment = CharField(db_column='auditor_comment', max_length=2048, blank=True)
    auditor_comment_original = CharField(db_column='auditor_comment_original', max_length=2048, blank=True)
    not_applicable = BooleanField(db_column='not_applicable', default=False, blank=False, null=False)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    attachments = GenericRelation('attachment.Attachment', related_query_name='report_sections')

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(ReportSection, self).save(*args, **kwargs)

    def __str__(self):
        return "ReportSection({}): {}, {}".format(self.id, self.pm_comment, self.auditor_comment)

    def max_marks(self):
        '''may return zero so make sure you check for DivideByZero before using this blindly in the denominator'''
        if self.not_applicable:
            return 0
        else:
            not_applicable_total = 0

            # check if prefetched cache exists,
            if hasattr(self, '_section_cache'):
                # run the summing code in python because we have already prefetched questions, answers for the report_sections
                for question in self.section.questions.all():
                    for answer in question.answers.all():
                        if answer.audit_store_id == self.audit_store_id and answer.not_applicable:
                            not_applicable_total += answer.question.max_marks
            else:
                # else ask the database to perform the summing for us
                not_applicable_total = Answer.objects.filter(
                    question__section=self.section,
                    audit_store_id=self.audit_store_id,
                    not_applicable=True
                ).aggregate(
                    not_applicable_total=Coalesce(
                        Sum(F('question__max_marks')),
                        Value(0)
                    )
                )["not_applicable_total"]

            return self.section.max_marks() - not_applicable_total

    def marks_obtained(self):
        if self.not_applicable:
            return 0
        else:
            # check if prefetched cache exists,
            if hasattr(self, '_section_cache'):
                marks_obtained = 0
                # run the summing code in python because we have already prefetched questions, answers for the report_sections
                for question in self.section.questions.all():
                    for answer in question.answers.all():
                        if answer.audit_store_id == self.audit_store_id and not answer.not_applicable and answer.marks_obtained:
                            marks_obtained += answer.marks_obtained
                return marks_obtained
            else:
                # else ask the database to perform the summing for us
                return Answer.objects.filter(
                    audit_store_id=self.audit_store_id,
                    question__section_id=self.section_id,
                    not_applicable=False
                ).aggregate(
                    marks_obtained=Coalesce(
                        Sum(F('marks_obtained')),
                        Value(0)
                    )
                )["marks_obtained"]

    def marks_percentage(self):
        max_marks = self.max_marks()
        if max_marks == 0:
            return 0
        return (self.marks_obtained() * 100.0) / max_marks

    def color_code(self):
        return get_color_code(self.marks_obtained(), self.max_marks())

    def set_not_applicable(self, not_applicable):
        self.not_applicable = not_applicable
        self.save()

    def set_auditor_comment(self, auditor_comment):
        if auditor_comment in (None, ""):
            raise AppLogicError("auditor comment cannot be blank")
        self.auditor_comment = auditor_comment
        self.save()

    class Meta:
        unique_together = (("audit_store","section"))
