from datetime import date
from model_mommy import mommy
from model_mommy.recipe import Recipe

from django.test import TestCase
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm

from kronos.exceptions import ObjectNotFound
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo
from audit.models import AuditCycle

from audit_store import service_moderator


class AuditStoreModeratorServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username="moderator@foobar.com",
                                         email="moderator@foobar.com",
                                         groups=[self.moderator_group])

    def create_reports(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store_recipe = Recipe(AuditStore, audit__audit_cycle=audit_cycle, user=self.auditor_user)

        a1 = audit_store_recipe.make(status=AuditStore.ACKNOWLEDGED)
        a2 = audit_store_recipe.make(status=AuditStore.SUBMITTED)
        a3 = audit_store_recipe.make(status=AuditStore.COMPLETED)
        a4 = audit_store_recipe.make(status=AuditStore.ACCEPTED)
        audit_store_recipe.make(status=AuditStore.COMPLETED)

        assign_perm('moderator_manage', self.moderator_user, a1)
        assign_perm('moderator_manage', self.moderator_user, a2)
        assign_perm('moderator_manage', self.moderator_user, a3)
        assign_perm('moderator_manage', self.moderator_user, a4)

    def test_find_qa_pending_audit_stores_for_moderator(self):
        self.create_reports()
        reports = service_moderator.find_qa_pending_audit_stores_for_moderator(self.moderator_user.id)
        self.assertEqual(reports.count(), 2)

    def test_find_qa_completed_audit_stores_for_moderator(self):
        self.create_reports()
        reports = service_moderator.find_qa_completed_audit_stores_for_moderator(self.moderator_user.id)
        self.assertEqual(reports.count(), 2)

    def test_find_by_id_for_moderator_returns_audit_store(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED, user=self.auditor_user)
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        actual_audit_store = service_moderator.find_by_id_for_moderator(audit_store.id, self.moderator_user.id)
        self.assertEqual(audit_store, actual_audit_store)

    def test_find_by_id_for_moderator_raises_when_audit_store_is_not_assigned(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED, user=self.auditor_user)
        with self.assertRaises(ObjectNotFound):
            service_moderator.find_by_id_for_moderator(audit_store.id, self.moderator_user.id)

    def test_fail_for_moderator_returns_audit_store_with_fail_status(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED,
                                 user=self.auditor_user)
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        report = service_moderator.fail_for_moderator(audit_store.id, self.moderator_user.id)
        self.assertEqual(AuditStore.FAILED, report.status)

    def test_submit_for_moderator_returns_audit_store_with_submitted_status(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.ACKNOWLEDGED,
                                 user=self.auditor_user)
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        report = service_moderator.submit_for_moderator(audit_store.id, self.moderator_user.id)
        self.assertEqual(AuditStore.SUBMITTED, report.status)

    def test_unsubmit_for_moderator_returns_audit_store_with_acknowledged_status(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED,
                                 user=self.auditor_user)
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        report = service_moderator.unsubmit_for_moderator(audit_store.id, self.moderator_user.id)
        self.assertEqual(AuditStore.ACKNOWLEDGED, report.status)

    def test_set_audit_date_for_moderator_sets_date_correctly(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED,
                                 user=self.auditor_user)
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        report = service_moderator.set_audit_date_for_moderator(audit_store.id, date(2018, 8, 15), self.moderator_user.id)
        self.assertEqual(date(2018, 8, 15), report.audit_date)

