from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE
from questionnaire.models import Question
from audit_store.models import AuditStore
from questionnaire.models import Section

class Answer(Model):

    id = AutoField(db_column = 'id', primary_key=True)

    question = ForeignKey('questionnaire.Question',  db_column='question_id', on_delete=CASCADE)
    audit_store = ForeignKey('audit_store.AuditStore', db_column='audit_store_id', on_delete=CASCADE)

    answer_text = CharField(db_column='answer_text', max_length=2048, blank=True)
    marks_obtained = IntegerField(db_column='marks_obtained', blank=True, null=True)
    attachments = GenericRelation('attachment.Attachment', related_query_name='answers')
    
class ReportSection(Model):
    
    id = AutoField(db_column = 'id', primary_key=True)
    audit_store = ForeignKey('audit_store.AuditStore', db_column='audit_store_id', blank=False)
    section = ForeignKey('questionnaire.Section', db_column='section_id', blank=False)
    pm_comment = CharField(db_column='pm_comment', max_length=2048, blank=True)
    auditor_comment = CharField(db_column='auditor_comment', max_length=2048, blank=True)

    attachments = GenericRelation('attachment.Attachment', related_query_name='report_sections')
    
    def __str__(self):
        return "ReportSection({}): {}, {}".format(self.id, self.pm_comment, self.auditor_comment)

    class Meta:
        unique_together = (("audit_store","section"))    
