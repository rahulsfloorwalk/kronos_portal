from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, PositiveIntegerField, BooleanField
from django.db.models import PROTECT, F, Sum
from auditor.models import AuditApplication

import audit_store

class AuditCycle(Model):

    WALKIN = 'WALKIN'
    PHONE = 'PHONE'
    WEB = 'WEB'
    VISIBILITY = 'VISIBILITY'
    COMPETITION = 'COMPETITION'
    SERVICE = 'SERVICE'
    SALES = 'SALES'
    FINE_DINE = 'FINE_DINE'
    SKY_KARTING = 'SKY_KARTING'
    SMAAASH_ARENA = 'SMAAASH_ARENA'
    GENERAL = 'GENERAL'
    TYPES = (
        (WALKIN, 'Walkin'),
        (PHONE, 'Phone'),
        (WEB, 'Web'),
        (VISIBILITY, 'Visibility'),
        (COMPETITION, 'Competition'),
        (SERVICE, 'Service'),
        (SALES, 'Sales'),
        (FINE_DINE, 'Fine Dine'),
        (SKY_KARTING, 'Sky Karting'),
        (SMAAASH_ARENA, 'Smaaash Arena'),
        (GENERAL, 'General'),
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
    revenue_per_audit = IntegerField(db_column='revenue_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    description = CharField(db_column='description', max_length=4096, blank=False)
    client = ForeignKey('client.Client', related_name='audits', db_column='client_id', on_delete=PROTECT)
    post_approval_description = CharField(db_column='post_approval_description', max_length=4096, blank=True)

    class Meta:
        permissions = (
            ('moderator_manage', 'Moderator can manage this Audit Cycle'),
        )

    def max_marks(self):
        return sum(s.max_marks() for s in self.sections.all())

    def audit_count(self):
        return sum(a.count for a in self.audits.all())
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audits' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched questions
            return sum(a.count for a in self.audits.all())
        else:
            return self.audits.aggregate(audit_count=Sum(F('count')))["audit_count"]

    def completed_audit_count(self):
        return audit_store.models.AuditStore.objects.filter(
            audit__audit_cycle_id=self.id,
            status__in=[audit_store.models.AuditStore.COMPLETED, audit_store.models.AuditStore.ACCEPTED]
        ).count()

    def completed_percentage(self):
        audit_count = self.audit_count()
        if audit_count is 0:
            return audit_count
        else:
            return self.completed_audit_count() * 100 / audit_count

    def __str__(self):
        return "AuditCycle({}): {}, client: {}".format(self.id, self.name, self.client)


class Audit(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    count = PositiveIntegerField(db_column='count', blank=False, default=1)
    audit_date = DateField(db_column='audit_date', blank=True, null=True)
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    store = ForeignKey('client.Store', related_name='audits', db_column='store_id', on_delete=PROTECT)
    audit_cycle = ForeignKey(AuditCycle, related_name='audits', db_column='audit_cycle_id', on_delete=PROTECT)
    post_approval_description = CharField(db_column='post_approval_description', max_length=4096, blank=True)
    hidden = BooleanField(db_column='hidden', default=False)

    def application_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'applications' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched questions
            return len([a for a in self.applications.all() if a.status != AuditApplication.NOT_APPLIED])
        else:
            return self.applications.exclude(status=AuditApplication.NOT_APPLIED).count()

    def valid_report_count(self):
        valid_status = (
            audit_store.models.AuditStore.COMPLETED,
            audit_store.models.AuditStore.ACCEPTED,
            audit_store.models.AuditStore.ASSIGNED,
            audit_store.models.AuditStore.ACKNOWLEDGED,
            audit_store.models.AuditStore.SUBMITTED,
        )
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audit_stores' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched questions
            return len([a for a in self.audit_stores.all() if a.status in valid_status])
        else:
            return self.audit_stores.filter(status__in=valid_status).count()

    def report_count(self):
        return self.audit_stores.count()

    def __str__(self):
        return "Audit({}): audit_cycle: {}, store: {}, count: {}".format(self.id, self.audit_cycle, self.store, self.count)

    class Meta:
        unique_together = (("store", "audit_cycle"))
