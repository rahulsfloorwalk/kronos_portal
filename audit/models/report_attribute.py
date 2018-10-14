from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, PositiveIntegerField, BooleanField, DateTimeField
from django.db.models import PROTECT, F, Sum
from django.contrib.postgres.fields import JSONField


class ReportAttribute(Model):
    id = AutoField(db_column='id', primary_key=True)
    json_id = CharField(db_column='json_id', max_length=20, blank=False)
    label = CharField(db_column='label', max_length=50, blank=False)
    audit_cycle = ForeignKey('audit.AuditCycle', db_column='audit_cycle_id', related_name='report_attributes', on_delete=PROTECT)
    attribute_data = JSONField(db_column='attribute_data', default=dict(), blank=False)

