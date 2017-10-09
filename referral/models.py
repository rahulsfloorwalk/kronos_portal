from django.db import models

from django.conf import settings
from django.db.models import Model, AutoField, CharField, IntegerField, ForeignKey, BooleanField, OneToOneField, DateTimeField, PROTECT

class AuditorReferral(Model):

    SIGNUP = 'SIGNUP'
    AUDIT = 'AUDIT'
    PAID = 'PAID'

    TYPE = (
        (SIGNUP, "Signup"),
        (AUDIT, "Audit"),
        (PAID, "Paid"),
    )

    id = AutoField(db_column='id', primary_key=True)
    comment = CharField(db_column='comment', max_length=500, null=False, blank=False)
    amount = IntegerField(db_column='amount', null=False)
    type = CharField(db_column='type', max_length=20, choices=TYPE, blank=False)
    referred_by = ForeignKey(settings.AUTH_USER_MODEL, db_column='referred_by', related_name='referred_by', on_delete=PROTECT)
    referred_to = ForeignKey(settings.AUTH_USER_MODEL, db_column='referred_to', related_name='referred_to', on_delete=PROTECT)
    added_on = DateTimeField(db_column='added_on', auto_now_add=True, null=False)
