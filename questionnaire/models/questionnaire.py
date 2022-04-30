from django.db.models import Model, CharField, AutoField, ForeignKey, OneToOneField
from django.contrib.postgres.fields import JSONField
from django.db.models import PROTECT


class Industry(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=500)


class ProblemStatement(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=500)
    industry = ForeignKey(Industry, related_name='problem_statements', db_column='industry_id', on_delete=PROTECT)


class SampleQuestionnaireType(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=500)
    problem_statement = ForeignKey(ProblemStatement, related_name='questionnaire_types', db_column='problem_statement_id', on_delete=PROTECT)


class SampleQuestionnaire(Model):
    """Model for store sample questionnaire for audit cycle
    Model for insert questionnaire in audit cycle"""

    id = AutoField(db_column = 'id', primary_key=True)
    questionnaire_data = JSONField(db_column='questionnaire_data', default=dict, blank=False)
    sample_questionnaire_type = OneToOneField(SampleQuestionnaireType, related_name='sample_questionnaire', db_column='sample_questionnaire_type_id', on_delete=PROTECT)