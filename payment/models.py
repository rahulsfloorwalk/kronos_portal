from django.conf import settings
from django.db.models import Model, AutoField, CharField, IntegerField, ForeignKey, DateTimeField, PROTECT, OneToOneField, BooleanField
from audit_store.models import AuditStore

class Payment(Model):

    PENDING = 'PENDING'
    PAID = 'PAID'
    FAILED = 'FAILED'

    STATUS = (
        (PENDING, "Pending"),
        (PAID, "Paid"),
        (FAILED, "Failed"),
    )

    id = AutoField(db_column='id', primary_key=True)
    comment = CharField(db_column='comment', max_length=500, null=False, blank=False)
    amount = IntegerField(db_column='amount',null=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False, default=PENDING)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', related_name='payments', on_delete=PROTECT)
    audit_store = ForeignKey(AuditStore, db_column='audit_store_id', related_name='payments', on_delete=PROTECT)
    added_on = DateTimeField(db_column='added_on', auto_now_add=True, null=False)
    paid_on = DateTimeField(db_column='paid_on', null=True)

    def get_audit_details(self):
        return {'audit_date': self.audit_store.audit_date,
                'client_name': self.audit_store.audit.audit_cycle.client.brand_name,
                'audit_type': self.audit_store.audit.audit_cycle.type,
                'client_logo_url': self.audit_store.audit.audit_cycle.client.logo_url}


class Beneficiary(Model):
    id = AutoField(db_column='id', primary_key=True)
    user = OneToOneField(settings.AUTH_USER_MODEL, related_name='beneficiary', on_delete=PROTECT)
    beneficiary_id = CharField(db_column='beneficiary_id', max_length=100, unique=True, editable=False)
    beneficiary_checked = BooleanField(db_column='beneficiary_checked', default=False)