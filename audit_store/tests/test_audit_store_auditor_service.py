from model_mommy import mommy
from model_mommy.recipe import Recipe

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from questionnaire.models import Section, Question
from answer.models import ReportSection, Answer

from audit_store import service_auditor


class AuditStoreAuditorServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def test_acknowledge_report_raises_when_user_is_not_report_user(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_auditor.acknowledge_report(audit_store.id, auditor.id)

    def test_acknowledge_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        acknowledged_audit_store = service_auditor.acknowledge_report(audit_store.id, self.auditor_user.id)
        self.assertEqual(AuditStore.ACKNOWLEDGED, acknowledged_audit_store.status)

    def create_submittable_report(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle,
            report_summary="Summary LoremLorem Lorem Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum nec justo id sollicitudin. Quisque et lectus velit consectetur adipiscing elit. Vivamus condimentum nec justo id sollicitudin. Quisque et lectus velit",
            report_summary_original='Foobar',
            nps_section=5,
        )
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        report_section_recipe = Recipe(ReportSection, audit_store=audit_store, auditor_comment="foobar foobar foobar foobar foobarfoobar foobar foobar foobar foobarfoobar foobar foobar foobar foobarfoobar foobar foobar foobar foobarfoobar foobar foo")
        for i in range(3):
            section = section_recipe.make()
            report_section_recipe.make(section=section)
            for i in range(5):
                question = mommy.make(Question, section=section)
                mommy.make(Answer, question=question, audit_store=audit_store, answer_text="foobar")

        return audit_store

    def test_set_report_summary_raises_when_report_is_not_acknowledged(self):
        mock_audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ASSIGNED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        report_summary = "foobar"
        with self.assertRaisesRegex(AppLogicError, "Cannot set report summary of current audit store"):
            service_auditor.set_report_summary(mock_audit_store.id, self.auditor_user.id, report_summary)

    def test_set_report_summary_copies_report_summary(self):
        mock_audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        report_summary = "foobar"
        audit_store = service_auditor.set_report_summary(mock_audit_store.id, self.auditor_user.id, report_summary)
        self.assertEqual(report_summary, audit_store.report_summary_original)

    def test_submit_report_raises_when_user_is_not_report_user(self):
        audit_store = self.create_submittable_report()
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_auditor.submit_report(audit_store.id, auditor.id)

    # def test_submit_report_raise_when_report_is_not_submittable(self):
    #     audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user,
    #                             audit__audit_cycle=self.audit_cycle,report_summary="Summary Lorem Lorem Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum nec justo id sollicitudin. Quisque et lectus velit consectetur adipiscing elit. Vivamus condimentum nec justo id sollicitudin. Quisque et lectus velit")

    #     section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
    #     for i in range(3):
    #         section_recipe.make()

    #     with self.assertRaisesRegex(AppLogicError, "Please complete all answers and all section summaries before submitting"):
    #         service_auditor.submit_report(audit_store.id, self.auditor_user.id)

    def test_submit_report_raises_for_multiple_conditions(self):
    # Scenario 1: Report summary is too short
        audit_store_short_summary = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle,
            report_summary="Short summary",
            nps_section=5
        )

        with self.assertRaisesRegex(AppLogicError, "Report summary should be at least 150 characters"):
            service_auditor.submit_report(audit_store_short_summary.id, self.auditor_user.id)

        # Scenario 2: Incomplete answers or section summaries
        audit_store_incomplete_sections = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle,
            report_summary="Summary " + "Lorem ipsum " * 20 , # Make it 150+ characters
            nps_section=5

        )

        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        for i in range(3):
            section_recipe.make()

        with self.assertRaisesRegex(AppLogicError, "Please complete all answers and all section summaries before submitting"):
            service_auditor.submit_report(audit_store_incomplete_sections.id, self.auditor_user.id)

    def test_submit_report_changes_report_status(self):
        audit_store = self.create_submittable_report()
        submitted_audit_store = service_auditor.submit_report(audit_store.id, self.auditor_user.id)
        self.assertEqual(AuditStore.SUBMITTED, submitted_audit_store.status)

