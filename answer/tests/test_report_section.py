from model_mommy import mommy
from faker import Faker

from django.test import TestCase

from answer.models import ReportSection

fake = Faker()
class ReportSectionTestCase(TestCase):

    def test_not_applicable_defaults_to_false(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        self.assertFalse(report_section.not_applicable)

    def test_set_not_applicable_sets_correctly(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        report_section.set_not_applicable(True)
        self.assertTrue(report_section.not_applicable)
        report_section.set_not_applicable(False)
        self.assertFalse(report_section.not_applicable)

