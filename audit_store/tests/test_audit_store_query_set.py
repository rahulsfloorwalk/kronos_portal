from datetime import datetime
from django.test import TestCase
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm

from model_mommy import mommy
from model_mommy.recipe import Recipe

from kronos.test_utils import catch_signal
from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore, AuditStoreQuerySet
from audit_store.signals import audit_store_status_change
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo


class AuditStoreQuerySetTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)

        self.moderator_user = mommy.make(User, username="moderator@foobar.com", email="moderator@foobar.com",
                                         groups=[self.moderator_group])
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_assign_audit_report_sends_signal(self):
        audit = mommy.make(Audit)
        with catch_signal(audit_store_status_change) as mock:
            audit_store = AuditStore.objects.assign_audit_store(audit, datetime.now().date(), self.auditor_user, self.manager_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStoreQuerySet,
                status=AuditStore.ASSIGNED,
                old_status=None,
                user_actor=self.manager_user,
                audit_store=audit_store,
            )

    def test_assign_audit_report_creates_and_assigns_audit_store(self):
        audit = mommy.make(Audit)
        audit_store = AuditStore.objects.assign_audit_store(audit, datetime.now().date(), self.auditor_user, self.manager_user)
        self.assertEqual(datetime.now().date(), audit_store.audit_date)
        self.assertEqual(self.auditor_user, audit_store.user)

    def test_presentable(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store_recipe = Recipe(AuditStore, audit__audit_cycle=audit_cycle, user=self.auditor_user)

        audit_store_recipe.make(status=AuditStore.SUBMITTED, _quantity=5)
        audit_store_recipe.make(status=AuditStore.COMPLETED, _quantity=2)

        self.assertEqual(AuditStore.objects.presentable().count(), 2)

    def test_for_moderator(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store_recipe = Recipe(AuditStore, audit__audit_cycle=audit_cycle, user=self.auditor_user)

        a1 = audit_store_recipe.make(status=AuditStore.SUBMITTED)
        audit_store_recipe.make(status=AuditStore.COMPLETED)
        a2 = audit_store_recipe.make(status=AuditStore.ACKNOWLEDGED)
        audit_store_recipe.make(status=AuditStore.ACCEPTED)

        assign_perm('moderator_manage', self.moderator_user, a1)
        assign_perm('moderator_manage', self.moderator_user, a2)

        self.assertEqual(AuditStore.objects.for_moderator(self.moderator_user).count(), 2)
