from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, OneToOneField
from django.db.models import CASCADE

class AuditStore(Model):
    db_table = 'audit_store'

    APPLIED = 'APPLIED'
    REJECTED = 'REJECTED'
    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    COMPLETED = 'COMPLETED'

    STATUS = (
            (APPLIED, "Applied"),
            (REJECTED, "Rejected"),
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (COMPLETED, "Completed"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey(Audit, db_column='audit_id')
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id')
