from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, OneToOneField
from django.db.models import CASCADE
from audit.models import Audit

class AuditStore(Model):
    db_table = 'audit_store'

    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    CANCELLED = 'CANCELLED'
    COMPLETED = 'COMPLETED'

    STATUS = (
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (COMPLETED, "Completed"),
            (CANCELLED, "Cancelled"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey(Audit, db_column='audit_id')
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id')
