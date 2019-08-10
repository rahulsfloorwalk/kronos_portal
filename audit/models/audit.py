from django.utils import timezone
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, PositiveIntegerField, BooleanField, DateTimeField
from django.db.models import PROTECT
from auditor.models import AuditApplication
import re
import audit_store


class Audit(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    count = PositiveIntegerField(db_column='count', blank=False, default=1)
    audit_date = DateField(db_column='audit_date', blank=True, null=True)
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    store = ForeignKey('client.Store', related_name='audits', db_column='store_id', on_delete=PROTECT)
    audit_cycle = ForeignKey('audit.AuditCycle', related_name='audits', db_column='audit_cycle_id', on_delete=PROTECT)
    post_approval_description = CharField(db_column='post_approval_description', max_length=4096, blank=True)
    hidden = BooleanField(db_column='hidden', default=False)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(Audit, self).save(*args, **kwargs)

    def application_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'applications' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched applications
            return len([a for a in self.applications.all() if a.status != AuditApplication.NOT_APPLIED])
        else:
            return self.applications.exclude(status=AuditApplication.NOT_APPLIED).count()

    def valid_report_count(self):
        valid_status = (
            audit_store.models.AuditStore.COMPLETED,
            audit_store.models.AuditStore.ACCEPTED,
            audit_store.models.AuditStore.ASSIGNED,
            audit_store.models.AuditStore.ACKNOWLEDGED,
            audit_store.models.AuditStore.PM_REVIEW,
            audit_store.models.AuditStore.SUBMITTED,
        )
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audit_stores' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched reports
            return len([a for a in self.audit_stores.all() if a.status in valid_status])
        else:
            return self.audit_stores.filter(status__in=valid_status).count()

    def report_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audit_stores' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched reports
            return len(self.audit_stores.all())
        else:
            return self.audit_stores.count()

    def get_pincode_audit(self):
        address = self.store.get_store_address()
        regex = "\d{6}"
        match = re.findall(regex, address)
        if match:
            pincode = match[0]
        else:
            pincode = None
        return pincode

    def __str__(self):
        return "Audit({}): audit_cycle: {}, store: {}, count: {}".format(self.id, self.audit_cycle, self.store, self.count)

    class Meta:
        unique_together = (("store", "audit_cycle"))
