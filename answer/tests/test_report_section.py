from model_mommy import mommy
from faker import Faker
from expects import expect, equal

from django.test import TestCase

from kronos.exceptions import AppLogicError

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

    def test_set_auditor_comment_sets_auditor_comment_correctly(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        auditor_comment = "Foobar"
        report_section.set_auditor_comment(auditor_comment)
        self.assertEqual(auditor_comment, report_section.auditor_comment)

    def test_set_auditor_comment_raises_when_auditor_comment_is_empty_or_none(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        auditor_comment = ""
        with self.assertRaisesRegex(AppLogicError, "auditor comment cannot be blank"):
            report_section.set_auditor_comment(auditor_comment)
        auditor_comment = None
        with self.assertRaisesRegex(AppLogicError, "auditor comment cannot be blank"):
            report_section.set_auditor_comment(auditor_comment)

    def test_set_pm_comment_sets_pm_comment_correctly(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        pm_comment = "Foobar"
        report_section.set_pm_comment(pm_comment)
        self.assertEqual(pm_comment, report_section.pm_comment)

    def test_set_pm_comment_raises_when_pm_comment_is_empty_or_none(self):
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email())
        pm_comment = ""
        with self.assertRaisesRegex(AppLogicError, "pm comment cannot be blank"):
            report_section.set_pm_comment(pm_comment)
        pm_comment = None
        with self.assertRaisesRegex(AppLogicError, "pm comment cannot be blank"):
            report_section.set_pm_comment(pm_comment)

    def test_copy_auditor_comment_original_copies_auditor_comment(self):
        auditor_comment = fake.name()
        report_section = mommy.make(ReportSection, audit_store__user__email=fake.email(), auditor_comment=auditor_comment, auditor_comment_original="")
        report_section.copy_auditor_comment_original()
        expect(report_section.auditor_comment_original).to(equal(auditor_comment))
