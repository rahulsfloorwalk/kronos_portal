from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from audit_store import service_agency as audit_store_service
from audit.models import AuditCycle
from answer.models import ReportSection, Answer
from questionnaire.models import Section, Question


class AuditStoreServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def test_find_audit_stores_for_agency_user_returns_list(self):
        status_list = AuditStore._ALL_STATUSES
        for status in status_list:
            mommy.make(AuditStore, status=status, user=self.agency_user,
                       audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_stores = audit_store_service.find_audit_stores_for_agency_user(agency_user_id=self.agency_user.id)
        self.assertEqual(8, len(audit_stores))

    def test_find_by_id_for_agency_user_returns_audit_store(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_store = audit_store_service.find_by_id_for_agency_user(mock_audit_store.id, self.agency_user.id)
        self.assertEqual(mock_audit_store, audit_store)

    def test_find_by_id_for_agency_user_raises_exception(self):
        withdrawn_audit_store = mommy.make(AuditStore, status=AuditStore.WITHDRAWN, user=self.agency_user,
                                           audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        self.assertRaises(ObjectNotFound, audit_store_service.find_by_id_for_agency_user, withdrawn_audit_store.id, self.agency_user.id)

    def test_acknowledge_report_raises_when_user_is_not_report_user(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=self.audit_cycle)
        another_agency_user = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.agency_group])
        with self.assertRaises(ObjectNotFound):
            audit_store_service.acknowledge_report(audit_store.id, another_agency_user.id)

    def test_acknowledge_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=self.audit_cycle)
        acknowledged_audit_store = audit_store_service.acknowledge_report(audit_store.id, self.agency_user.id)
        self.assertEqual(AuditStore.ACKNOWLEDGED, acknowledged_audit_store.status)

    def create_submittable_report(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.agency_user,
            audit__audit_cycle=self.audit_cycle,
            report_summary='Foobar',
            report_summary_original='Foobar',
        )
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        report_section_recipe = Recipe(ReportSection, audit_store=audit_store, auditor_comment="foobar")
        for i in range(3):
            section = section_recipe.make()
            report_section_recipe.make(section=section)
            for i in range(5):
                question = mommy.make(Question, section=section)
                mommy.make(Answer, question=question, audit_store=audit_store, answer_text="foobar")

        return audit_store

    def test_submit_report_raises_when_user_is_not_report_user(self):
        audit_store = self.create_submittable_report()
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com",
                             groups=[self.agency_group])
        with self.assertRaises(ObjectNotFound):
            audit_store_service.submit_report(audit_store.id, auditor.id)

    def test_submit_report_raise_when_report_is_not_submittable(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=self.audit_cycle)
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        for i in range(3):
            section_recipe.make()

        with self.assertRaisesRegex(AppLogicError, "Report cannot be submitted now"):
            audit_store_service.submit_report(audit_store.id, self.agency_user.id)

    def test_set_report_summary_raises_when_report_is_not_acknowledged(self):
        mock_audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ASSIGNED,
            user=self.agency_user,
            audit__audit_cycle=self.audit_cycle
        )
        report_summary = "foobar"
        with self.assertRaisesRegex(AppLogicError, "Cannot set report summary of current audit store"):
            audit_store_service.set_report_summary(mock_audit_store.id, self.agency_user.id, report_summary)

    def test_set_report_summary_copies_report_summary(self):
        mock_audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.agency_user,
            audit__audit_cycle=self.audit_cycle
        )
        report_summary = "foobar"
        audit_store = audit_store_service.set_report_summary(mock_audit_store.id, self.agency_user.id, report_summary)
        self.assertEqual(report_summary, audit_store.report_summary_original)


    def test_submit_report_changes_report_status(self):
        audit_store = self.create_submittable_report()
        submitted_audit_store = audit_store_service.submit_report(audit_store.id, self.agency_user.id)
        self.assertEqual(AuditStore.SUBMITTED, submitted_audit_store.status)
