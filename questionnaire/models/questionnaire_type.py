from django.db.models import Model, CharField, AutoField, ForeignKey
from django.db.models import BooleanField
from django.db.models import PROTECT

from client.models import Client

class QuestionnaireType(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=500)
    is_default = BooleanField(db_column='is_default', default=False)
    client = ForeignKey(Client, related_name='questionnaire_types', db_column='client_id', on_delete=PROTECT)
