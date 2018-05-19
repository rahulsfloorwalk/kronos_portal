from model_mommy import mommy
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm

from kronos.exceptions import ObjectNotFound

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

    def test_complete_for_moderator_changes_status_to_completed(self):
        audit_store = mommy.make(AuditStore,
                                 status=AuditStore.SUBMITTED,
                                 audit__audit_cycle__status=AuditCycle.ACTIVE,
                                 user=self.auditor_user,
                                 qa_rating=AuditStore.GOOD)
        assign_perm('moderator_manage', self.moderator_user, audit_store)

        audit_store = service_moderator.complete_for_moderator(audit_store.id, self.moderator_user.id)
        self.assertEqual(audit_store.status, AuditStore.COMPLETED)

    def test_complete_for_moderator_raises_when_report_is_not_assigned(self):
        audit_store = mommy.make(AuditStore,
                                 status=AuditStore.SUBMITTED,
                                 audit__audit_cycle__status=AuditCycle.ACTIVE,
                                 user=self.auditor_user,
                                 qa_rating=AuditStore.GOOD)

        with self.assertRaises(ObjectNotFound):
            service_moderator.complete_for_moderator(audit_store.id, self.moderator_user.id)

