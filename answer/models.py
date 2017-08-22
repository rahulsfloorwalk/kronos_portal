from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, BooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE, F, Value, Sum
from django.db.models.functions import Coalesce

from kronos.utils import get_color_code

from questionnaire.models import Question
from questionnaire.models import Section

class Answer(Model):

    id = AutoField(db_column = 'id', primary_key=True)

    question = ForeignKey('questionnaire.Question',  db_column='question_id', on_delete=CASCADE)
    audit_store = ForeignKey('audit_store.AuditStore', related_name='answers', db_column='audit_store_id', on_delete=CASCADE)

    answer_text = CharField(db_column='answer_text', max_length=2048, blank=True)
    answer_text_original = CharField(db_column='answer_text_original', max_length=2048, blank=True)
    marks_obtained = IntegerField(db_column='marks_obtained', blank=True, null=True)
    not_applicable = BooleanField(db_column='not_applicable', default=False, blank=False, null=False)
    answer_comment = CharField(db_column='answer_comment', max_length=2048, blank=True)
    attachments = GenericRelation('attachment.Attachment', related_query_name='answers')

    class Meta:
        unique_together = (('question', 'audit_store',))

class ReportSection(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    audit_store = ForeignKey('audit_store.AuditStore', related_name='report_sections', db_column='audit_store_id', blank=False)
    section = ForeignKey('questionnaire.Section', db_column='section_id', blank=False)
    pm_comment = CharField(db_column='pm_comment', max_length=2048, blank=True)
    auditor_comment = CharField(db_column='auditor_comment', max_length=2048, blank=True)
    auditor_comment_original = CharField(db_column='auditor_comment_original', max_length=2048, blank=True)
    not_applicable = BooleanField(db_column='not_applicable', default=False, blank=False, null=False)

    attachments = GenericRelation('attachment.Attachment', related_query_name='report_sections')

    def __str__(self):
        return "ReportSection({}): {}, {}".format(self.id, self.pm_comment, self.auditor_comment)

    def max_marks(self):
        '''may return zero so make sure you check for DivideByZero before using this blindly in the denominator'''
        if self.not_applicable:
            return 0
        else:
            not_applicable_total = Answer.objects.filter(
                    question__section=self.section,
                    audit_store=self.audit_store,
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
        return (self.marks_obtained()*100.0)/max_marks


    def color_code(self):
        return get_color_code(self.marks_obtained(), self.max_marks())

    class Meta:
        unique_together = (("audit_store","section"))
