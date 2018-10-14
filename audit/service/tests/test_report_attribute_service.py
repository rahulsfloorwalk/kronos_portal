from unittest.mock import patch

from rest_framework.test import APITestCase

from django.db import IntegrityError

from model_mommy import mommy
from expects import expect, equal, have_length, have_property, be_none

from faker import Faker

from audit.models import AuditCycle
from audit.models import ReportAttribute
from audit.service import report_attribute_service

fake = Faker()


class ReportAttributeServiceTestCase(APITestCase):

    def test_find_by_audit_cycle_id_returns_report_attributes(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(ReportAttribute, audit_cycle=audit_cycle, _quantity=3)
        mommy.make(ReportAttribute, audit_cycle=mommy.make(AuditCycle))

        response = report_attribute_service.find_report_attributes_by_audit_cycle_id(audit_cycle.id)
        expect(response).to(have_length(3))
        for ra in response:
            expect(ra).to(have_property("audit_cycle_id", audit_cycle.id))


    def test_create_report_attribute_creates_report_attribute(self):
        audit_cycle = mommy.make(AuditCycle)
        label = "label1"
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "1",
                    "option_label": "label1"
                },
                {
                    "option_id": "2",
                    "option_label": "label2"
                },
            ],
        }
        saved_report_attribute = report_attribute_service.create_report_attribute(audit_cycle.id, label, attribute_data)
        expect(saved_report_attribute.label).to(equal(label))
        expect(saved_report_attribute.attribute_data).to(equal(attribute_data))
        expect(saved_report_attribute.id).not_to(be_none)
        expect(saved_report_attribute.json_id).not_to(be_none)
        expect(saved_report_attribute.json_id).to(have_length(10))
        expect(saved_report_attribute.audit_cycle).to(equal(audit_cycle))

    def test_create_report_attribute_raises_integrity_error_when_json_id_not_unique(self):
        audit_cycle = mommy.make(AuditCycle)
        dup_string = "1234567890"
        label = "MyLabel"
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "1",
                    "option_label": "label1"
                },
                {
                    "option_id": "2",
                    "option_label": "label2"
                },
            ],
        }
        with self.assertRaisesRegex(IntegrityError, "duplicate key value violates unique constraint"):
            with patch.object(report_attribute_service, '_generate_json_id', return_value=dup_string):
                report_attribute_service.create_report_attribute(audit_cycle.id, label, attribute_data)
                report_attribute_service.create_report_attribute(audit_cycle.id, label, attribute_data)
