from django.conf import settings
from django.db.models import Model, AutoField, CharField, IntegerField, ForeignKey, BooleanField, OneToOneField
from audit_store.models import AuditStore

class Payment(Model):

    PENDING = 'PENDING'
    PAID = 'PAID'

    STATUS = (
        (PENDING, "Pending"),
        (PAID, "Paid"),
    )

    id = AutoField(db_column='id', primary_key=True)
    comment = CharField(db_column='comment', max_length=500, blank=True)
    amount = IntegerField(db_column='amount',null=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False, default=PENDING)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', related_name='payments')
    audit_store = OneToOneField(AuditStore, db_column='audit_store_id', related_name='payments')
    deleted = BooleanField(db_column='deleted', default=False)
