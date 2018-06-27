from datetime import date

from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from questionnaire.models import Question
from auditor.models import ProfileInfo
from audit_store import service
from audit.models import AuditCycle, Audit


class AuditStoreServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_complete_changes_status_from_pm_review_to_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_store = service.complete(audit_store.id, self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.COMPLETED)

    def test_complete_raises_when_report_is_not_completable(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        mommy.make(Question, section__audit_cycle=audit_cycle)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report is not complete."):
            service.complete(audit_store.id, self.manager_user)

    def test_complete_raises_when_report_is_not_qa_rated(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        with self.assertRaises(AppLogicError, msg="Report is not rated. Please rate the report before completing."):
            service.complete(audit_store.id, self.manager_user)

    def test_complete_raises_when_report_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        with self.assertRaises(AppLogicError, msg="audit store cannot be completed now"):
            service.complete(audit_store.id, self.manager_user)

    def test_fail_changes_status_to_failed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store = service.fail(audit_store.id, self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.FAILED)

    def test_fail_raises_when_status_is_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="audit store cannot be failed now"):
            service.fail(audit_store.id, self.manager_user)

    def test_uncomplete_changes_status_from_completed_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        audit_store = service.uncomplete(audit_store.id, self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.PM_REVIEW)

    def test_uncomplete_raises_when_status_is_not_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="audit store cannot be uncompleted now"):
            service.uncomplete(audit_store.id, self.manager_user)

    def test_withdraw_changes_status_from_valid_state_to_withdrawn(self):
        for status in AuditStore._WITHDRAWABLE_STATUSES:
            audit_store = mommy.make(AuditStore, status=status, user=self.auditor_user)
            audit_store = service.withdraw(audit_store.id, self.manager_user)
            self.assertEqual(audit_store.status, AuditStore.WITHDRAWN)

    def test_withdraw_raises_when_status_is_not_valid(self):
        invalid_statuses = set([s[0] for s in AuditStore.STATUS]) - set(AuditStore._WITHDRAWABLE_STATUSES)
        for status in invalid_statuses:
            audit_store = mommy.make(AuditStore, status=status, user=self.auditor_user)
            with self.assertRaises(AppLogicError, msg="audit store cannot be withdrawn now"):
                audit_store = service.withdraw(audit_store.id, self.manager_user)

    def test_set_audit_date_sets_audit_date_when_status_is_submitted(self):
        start_date = date(2018, 5, 1)
        end_date = date(2018, 5, 31)
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.SUBMITTED,
            user=self.auditor_user,
            audit__audit_cycle__start_date=start_date,
            audit__audit_cycle__end_date=end_date,
        )
        audit_date = date(2018, 5, 15)
        audit_store = service.set_audit_date(audit_store.id, audit_date)
        self.assertEqual(audit_store.audit_date, audit_date)

    def test_set_audit_date_sets_audit_date_when_status_is_pm_review(self):
        start_date = date(2018, 5, 1)
        end_date = date(2018, 5, 31)
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.PM_REVIEW,
            user=self.auditor_user,
            audit__audit_cycle__start_date=start_date,
            audit__audit_cycle__end_date=end_date,
        )
        audit_date = date(2018, 5, 15)
        audit_store = service.set_audit_date(audit_store.id, audit_date)
        self.assertEqual(audit_store.audit_date, audit_date)

    def test_set_audit_date_raises_when_audit_date_is_out_of_range(self):
        start_date = date(2018, 5, 1)
        end_date = date(2018, 5, 31)
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.SUBMITTED,
            user=self.auditor_user,
            audit__audit_cycle__start_date=start_date,
            audit__audit_cycle__end_date=end_date,
        )
        audit_date = date(2018, 6, 15)
        with self.assertRaises(AppLogicError, msg="audit date is out of range"):
            service.set_audit_date(audit_store.id, audit_date)

    def test_set_audit_date_raises_when_status_is_not_submitted_or_pm_review(self):
        start_date = date(2018, 5, 1)
        end_date = date(2018, 5, 31)
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle__start_date=start_date,
            audit__audit_cycle__end_date=end_date,
        )
        audit_date = date(2018, 5, 15)
        with self.assertRaises(AppLogicError, msg="audit date cannot be set right now"):
            service.set_audit_date(audit_store.id, audit_date)

    def create_reports(self):
        active_audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        archived_audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ARCHIVED)
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)

        audit_store_recipe.make(audit__audit_cycle=active_audit_cycle, status=AuditStore.ASSIGNED)
        audit_store_recipe.make(audit__audit_cycle=active_audit_cycle, status=AuditStore.ACKNOWLEDGED)
        audit_store_recipe.make(audit__audit_cycle=active_audit_cycle, status=AuditStore.SUBMITTED)
        audit_store_recipe.make(audit__audit_cycle=active_audit_cycle, status=AuditStore.PM_REVIEW)
        audit_store_recipe.make(audit__audit_cycle=active_audit_cycle, status=AuditStore.COMPLETED)
        audit_store_recipe.make(audit__audit_cycle=archived_audit_cycle, status=AuditStore.FAILED)
        audit_store_recipe.make(audit__audit_cycle=archived_audit_cycle, status=AuditStore.ACCEPTED)
        audit_store_recipe.make(audit__audit_cycle=archived_audit_cycle, status=AuditStore.REJECTED)

    def test_find_audit_stores_for_auditor(self):
        self.create_reports()
        reports = service.find_audit_stores_for_auditor(self.auditor_profile.id)
        self.assertEqual(reports.count(), 5)

    def test_find_by_id_for_auditor(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.PM_REVIEW,
            audit__audit_cycle__status=AuditCycle.ACTIVE,
            user=self.auditor_user
        )
        fetched_audit_store = service.find_by_id_for_auditor(audit_store.id, self.auditor_user.id)
        self.assertEqual(fetched_audit_store, audit_store)

    def test_find_by_audit_cycle_returns_the_right_reports(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(AuditStore, user=self.auditor_user, audit__audit_cycle=audit_cycle, _quantity=5)

        audit_stores = service.find_by_audit_cycle(audit_cycle.id)
        self.assertEqual(len(audit_stores), 5)
        for report in audit_stores:
            self.assertEqual(report.audit.audit_cycle, audit_cycle)

    def test_find_by_audit_returns_the_right_reports(self):
        audit = mommy.make(Audit)
        mommy.make(AuditStore, user=self.auditor_user, audit=audit, _quantity=5)

        audit_stores = service.find_by_audit(audit.id)
        self.assertEqual(len(audit_stores), 5)
        for report in audit_stores:
            self.assertEqual(report.audit, audit)
