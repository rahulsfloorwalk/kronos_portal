from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE

from manager.models import Client

#class Questionnaire(Model):
#    db_table = "questionnaire"
#
#    id = AutoField(db_column = 'id', primary_key=True)
#    name = CharField(db_column='name', max_length=50, blank=False)
#    client = ForeignKey(Client, related_name='questionnaires', db_column='client_id', blank=False)
#
#    def __str__(self):
#        return 'Questionnaire({}): {}'.format(self.id, self.name)

class Section(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    audit_cycle = ForeignKey('audit.AuditCycle', related_name='sections', db_column='audit_cycle_id', blank=False)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)

    def __str__(self):
        return 'Section({}): {}'.format(self.id, self.name)

    def max_marks(self):
        questions = Question.objects.filter(section_id=self.id)
        return sum(q.max_marks for q in questions if type(q.max_marks) is int)

    class Meta:
        ordering = ['sequence']

class Question(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    question_txt = CharField(db_column="question_txt", max_length=1024, blank=False)
    max_marks = PositiveIntegerField(db_column='max_marks', blank=False)
    section = ForeignKey(Section, related_name='questions', db_column='section_id', blank=False)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)

    def __str__(self):
        return 'Question({}): {}, {}'.format(self.id, self.question_txt, self.max_marks)

    class Meta:
        ordering = ['sequence']
