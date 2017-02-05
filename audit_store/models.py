from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, OneToOneField
from django.db.models import CASCADE
from audit.models import Audit

class AuditStore(Model):

    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    SUBMITTED = 'SUBMITTED'
    WITHDRAWN = 'WITHDRAWN'
    COMPLETED = 'COMPLETED'

    STATUS = (
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (SUBMITTED, "Submitted"),
            (COMPLETED, "Completed"),
            (WITHDRAWN, "Withdrawn"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey(Audit, db_column='audit_id', related_name='audit_stores')
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id')
