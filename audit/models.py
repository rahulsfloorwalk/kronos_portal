from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE

class AuditCycle(Model):

    WALKIN = 'WALKIN'
    PHONE = 'PHONE'
    WEB = 'WEB'
    VISIBILITY = 'VISIBILITY'
    COMPETITION = 'COMPETITION'
    TYPES = (
        (WALKIN, 'Walkin'),
        (PHONE, 'Phone'),
        (WEB, 'Web'),
        (VISIBILITY, 'Visibility'),
        (COMPETITION, 'Competition'),
    )

    PREPARATION = 'PREPARATION'
    UPCOMING = 'UPCOMING'
    ACTIVE = 'ACTIVE'
    REPORT = 'REPORT'
    ARCHIVED = 'ARCHIVED'
    STATUS = (
        (PREPARATION, 'Preparation'),
        (UPCOMING, 'Upcoming'),
        (ACTIVE, 'Active'),
        (REPORT, 'Report'),
        (ARCHIVED, 'Archived'),
    )

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    type = CharField(db_column='type', max_length=20, choices=TYPES, blank=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    start_date = DateField(db_column='start_date')
    end_date = DateField(db_column='end_date')
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    description = CharField(db_column='description', max_length=200, blank=False)
    client = ForeignKey('client.Client', related_name='audits', db_column='client_id', on_delete=CASCADE)

#    def audit_count(self):
#        count = 0;
#        for al in self.audits.all():
#            count = count + 1
#        return count
#
#    def cities(self):
#        cities = [al.location.city for al in self.auditlocations.all()]
#        return set(cities)

    def __str__(self):
        return "AuditCycle({}): client: {}".format(self.id, self.client)


class Audit(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    count = PositiveIntegerField(db_column='count', blank=False, default=1)
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    store = ForeignKey('client.Store', related_name='audits', db_column='store_id')
    audit_cycle = ForeignKey(AuditCycle, related_name='audits', db_column='audit_cycle_id')

    def __str__(self):
        return "Audit({}): {}, {}".format(self.id, self.store, self.audit_cycle, self.count)

    class Meta:
        unique_together = (("store", "audit_cycle"))
