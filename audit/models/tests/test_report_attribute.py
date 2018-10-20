from django.test import TestCase

from expects import expect, be_true, be_false

from model_mommy import mommy

from kronos.exceptions import AppLogicError
from audit.models import ReportAttribute, AuditCycle


class ReportAttributeTestCase(TestCase):

    def test_clean_does_not_raise_for_valid_attribute_data(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
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
        report_attribute.attribute_data = valid_attribute_data
        report_attribute.clean()

    def test_clean_raises_when_version_is_missing(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
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
        report_attribute.attribute_data = valid_attribute_data
        with self.assertRaisesRegex(AppLogicError, "'version' is a required property"):
            report_attribute.clean()

    def test_clean_raises_when_options_key_is_missing(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
            "version": 1
        }
        report_attribute.attribute_data = valid_attribute_data
        with self.assertRaisesRegex(AppLogicError, "'options' is a required property"):
            report_attribute.clean()

    def test_clean_raises_when_options_length_is_less_than_two(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "1",
                    "option_label": "label1"
                },
            ],
        }
        report_attribute.attribute_data = valid_attribute_data
        with self.assertRaisesRegex(AppLogicError, ".* is too short"):
            report_attribute.clean()

    def test_clean_raises_when_options_contains_duplicates(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "1",
                    "option_label": "label1"
                },
                {
                    "option_id": "1",
                    "option_label": "label1"
                },
            ],
        }
        report_attribute.attribute_data = valid_attribute_data
        with self.assertRaisesRegex(AppLogicError, ".* has non-unique element"):
            report_attribute.clean()

    def test_clean_raises_when_option_id_are_not_present(self):
        report_attribute = ReportAttribute()
        valid_attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_label": "label1"
                },
                {
                    "option_label": "label2"
                },
            ],
        }
        report_attribute.attribute_data = valid_attribute_data
        with self.assertRaisesRegex(AppLogicError, "'option_id' is a required property"):
            report_attribute.clean()

    def test_option_exists_returns_true_when_given_option_id_exists(self):
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "opt1",
                    "option_label": "label1"
                },
                {
                    "option_id": "opt2",
                    "option_label": "label2"
                },
            ],
        }
        report_attribute = ReportAttribute(attribute_data=attribute_data)
        expect(report_attribute.option_exists("opt1")).to(be_true)

    def test_option_exists_returns_false_when_given_option_id_does_not_exist(self):
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "opt1",
                    "option_label": "label1"
                },
                {
                    "option_id": "opt2",
                    "option_label": "label2"
                },
            ],
        }
        report_attribute = ReportAttribute(attribute_data=attribute_data)
        expect(report_attribute.option_exists("opt3")).to(be_false)