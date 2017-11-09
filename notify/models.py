from django.utils import timezone
from django.db.models import Model, AutoField, DateTimeField, ForeignKey, PositiveIntegerField
from django.db.models import PROTECT

from audit.models import AuditCycle
from manager.models import City


class OpportunityEmailRecord(Model):
    id = AutoField(db_column='id', primary_key=True)
    audit_cycle = ForeignKey(AuditCycle, db_column='audit_cycle_id', on_delete=PROTECT)
    city = ForeignKey(City, db_column='city_id', on_delete=PROTECT)
    total_count = PositiveIntegerField(db_column='total_count', blank=False)
    progress_count = PositiveIntegerField(db_column='progress_count', blank=False, default=0)

    created_at = DateTimeField(db_column="created_at")
    modified_at = DateTimeField(db_column="modified_at")

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(OpportunityEmailRecord, self).save(*args, **kwargs)

    def __str__(self):
        return "OpportunityEmailRecord({}): audit_cycle: {}, city: {}, progress: {}/{}".format(self.id, self.audit_cycle, self.city, self.progress_count, self.total_count)

    class Meta:
        ordering = ['-created_at']
