from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy

from kronos.exceptions import AppLogicError
from answer.models import ReportSection
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from answer.service import report_section_agency as agency_report_section_service
from questionnaire.models import Section


class AnswerAgencyServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def test_find_by_audit_store_for_agency(self):
        mock_audit_store = mommy.make(AuditStore, user=self.agency_user, audit__audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=mock_audit_store, section__audit_cycle=self.audit_cycle, _quantity=5)
        report_sections = agency_report_section_service.find_by_audit_store_for_agency(mock_audit_store.id, self.agency_user.id)
        self.assertEqual(5, len(report_sections))

    def test_find_by_audit_store_and_section_for_agency(self):
        mock_audit_store = mommy.make(AuditStore, user=self.agency_user, audit__audit_cycle=self.audit_cycle)
        mock_section = mommy.make(Section, audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=mock_audit_store, section=mock_section)
        report_section = agency_report_section_service.find_by_audit_store_and_section_for_agency(mock_audit_store.id, mock_section.id, self.agency_user.id)
        self.assertEqual(mock_audit_store, report_section.audit_store)
        self.assertEqual(mock_section, report_section.section)

    def test_submit_auditor_comment_for_agency_raises_exeption(self):
        # audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user, audit__audit_cycle=self.audit_cycle)
        mock_section = mommy.make(Section, audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=mock_audit_store, section=mock_section)
        auditor_comment = "foobar"
        with self.assertRaisesRegex(AppLogicError, "Cannot submit auditor comment to current audit store"):
            agency_report_section_service.submit_auditor_comment_for_agency(mock_audit_store.id, mock_section.id,
                                                                            self.agency_user.id, auditor_comment)

    def test_submit_auditor_comment_for_agency_for_existing_report_section(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=audit_cycle)
        mock_section = mommy.make(Section, audit_cycle=audit_cycle)
        mommy.make(ReportSection, audit_store=mock_audit_store, section=mock_section)
        auditor_comment = "foobar"
        report_section = agency_report_section_service.submit_auditor_comment_for_agency(mock_audit_store.id, mock_section.id, self.agency_user.id, auditor_comment)
        self.assertEqual(auditor_comment, report_section.auditor_comment)

    def test_submit_auditor_comment_for_agency_for_new_report_section(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=audit_cycle)
        mock_section = mommy.make(Section, audit_cycle=audit_cycle)
        auditor_comment = "foobar"
        report_section = agency_report_section_service.submit_auditor_comment_for_agency(mock_audit_store.id, mock_section.id, self.agency_user.id, auditor_comment)
        self.assertEqual(auditor_comment, report_section.auditor_comment)
