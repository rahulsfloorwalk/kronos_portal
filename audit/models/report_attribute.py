from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, PositiveIntegerField, BooleanField, DateTimeField
from django.db.models import PROTECT, F, Sum
from django.contrib.postgres.fields import JSONField

from jsonschema import validate
from jsonschema.exceptions import ValidationError

from kronos.exceptions import AppLogicError


class ReportAttribute(Model):
    ATTRIBUTE_DATA_VERSION_1 = 1

    ATTRIBUTE_DATA_SCHEMA_V1 = {
        "type": "object",
        "required": ["version", "options"],
        "properties": {
            "version": {
                "type": "integer",
            },
            "options": {
                "type": "array",
                "uniqueItems": True,
                "minItems": 2,
                "items": {
                    "type": "object",
                    "required": ["option_id", "option_label"],
                    "properties": {
                        "option_id": {
                            "type": "string",
                        },
                        "option_label": {
                            "type": "string",
                        },
                    },
                }
            },
        },
    }

    id = AutoField(db_column='id', primary_key=True)
    json_id = CharField(db_column='json_id', max_length=20, blank=False)
    label = CharField(db_column='label', max_length=50, blank=False)
    audit_cycle = ForeignKey('audit.AuditCycle', db_column='audit_cycle_id', related_name='report_attributes', on_delete=PROTECT)
    attribute_data = JSONField(db_column='attribute_data', default=dict(), blank=False)

    def clean(self):
        try:
            validate(self.attribute_data, self.ATTRIBUTE_DATA_SCHEMA_V1)
        except ValidationError as v:
            raise AppLogicError(v.message) from v

    def option_exists(self, option_id):
        return option_id in [opt["option_id"] for opt in self.attribute_data["options"]]

    class Meta:
        unique_together = ('audit_cycle', 'json_id')
