from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm

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
