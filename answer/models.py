from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE
from questionnaire.models import Question
from audit_store.models import AuditStore

class Answer(Model):

    id = AutoField(db_column = 'id', primary_key=True)

    question = ForeignKey('questionnaire.Question',  db_column='question_id', on_delete=CASCADE)
    audit_store = ForeignKey('audit_store.AuditStore', db_column='audit_store_id', on_delete=CASCADE)

    answer_text = CharField(db_column='answer_text', max_length=2048, blank=False)
    marks_obtained = IntegerField(db_column='marks_obtained', blank=True, null=True)
